-- ============================================================================
-- UtsavAI - Complete Production Migration: 13 Missing Tables & RLS Policies
-- Migration: 20261030000001_missing_tables.sql
-- Purpose: Safely creates the 13 child and auxiliary tables without affecting
--          existing public.profiles and public.events data.
-- Idempotent: Safe to execute repeatedly in Supabase SQL Editor or Supabase CLI.
-- ============================================================================

-- Step 0: Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 1: Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Step 2: TABLE DEFINITIONS (Created in strict dependency order)
-- ============================================================================

-- 1. EVENT PREFERENCES (1:1 with events)
CREATE TABLE IF NOT EXISTS public.event_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
    theme VARCHAR(200),
    style VARCHAR(200),
    priorities JSONB DEFAULT '[]'::jsonb,
    special_requirements TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. BUDGET CATEGORIES
CREATE TABLE IF NOT EXISTS public.budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    planned_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (planned_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_budget_categories_event_name UNIQUE (event_id, name)
);

-- 3. VENDORS (Created before expenses & schedule items to satisfy FK references)
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Venue', 'Catering', 'Photography', 'Decoration', 'Music', 'Transportation', 'Security', 'Entertainment', 'Other')),
    contact_name VARCHAR(200),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    website VARCHAR(500),
    quoted_price NUMERIC(12, 2) DEFAULT 0.00 CHECK (quoted_price >= 0),
    agreed_price NUMERIC(12, 2) DEFAULT 0.00 CHECK (agreed_price >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'Researching' CHECK (status IN ('Researching', 'Shortlisted', 'Contacted', 'Negotiating', 'Booked', 'Completed', 'Cancelled')),
    booking_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EXPENSES (References events, budget_categories, vendors)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    description VARCHAR(500) NOT NULL,
    planned_amount NUMERIC(12, 2) DEFAULT 0.00 CHECK (planned_amount >= 0),
    actual_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (actual_amount >= 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(30) NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
    due_date DATE,
    assigned_to VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TASK DEPENDENCIES (References tasks twice)
CREATE TABLE IF NOT EXISTS public.task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_task_dependencies_no_self CHECK (task_id <> depends_on_task_id),
    CONSTRAINT uq_task_dependencies_pair UNIQUE (task_id, depends_on_task_id)
);

-- 7. EVENT MILESTONES
CREATE TABLE IF NOT EXISTS public.event_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    milestone_date DATE NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Overdue')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. EVENT SCHEDULE ITEMS
CREATE TABLE IF NOT EXISTS public.event_schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    activity VARCHAR(300) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    description TEXT,
    location VARCHAR(200),
    responsible_person VARCHAR(200),
    responsible_vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. GUESTS
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    group_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    rsvp_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (rsvp_status IN ('Pending', 'Accepted', 'Declined')),
    plus_one BOOLEAN NOT NULL DEFAULT FALSE,
    meal_preference VARCHAR(100),
    special_requirements TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AI CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL DEFAULT 'Event Planning Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. AI MESSAGES
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AI GENERATED PLANS
CREATE TABLE IF NOT EXISTS public.ai_generated_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_data JSONB NOT NULL,
    model VARCHAR(100) NOT NULL DEFAULT 'gemini-1.5-flash',
    status VARCHAR(30) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Accepted', 'Discarded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Step 3: AUTOMATED UPDATED_AT TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS trg_event_preferences_updated_at ON public.event_preferences;
CREATE TRIGGER trg_event_preferences_updated_at BEFORE UPDATE ON public.event_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_budget_categories_updated_at ON public.budget_categories;
CREATE TRIGGER trg_budget_categories_updated_at BEFORE UPDATE ON public.budget_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_vendors_updated_at ON public.vendors;
CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_expenses_updated_at ON public.expenses;
CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_event_milestones_updated_at ON public.event_milestones;
CREATE TRIGGER trg_event_milestones_updated_at BEFORE UPDATE ON public.event_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_event_schedule_items_updated_at ON public.event_schedule_items;
CREATE TRIGGER trg_event_schedule_items_updated_at BEFORE UPDATE ON public.event_schedule_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_guests_updated_at ON public.guests;
CREATE TRIGGER trg_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_ai_conversations_updated_at ON public.ai_conversations;
CREATE TRIGGER trg_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Step 4: PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_event_preferences_event_id ON public.event_preferences(event_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_event_id ON public.budget_categories(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event_id ON public.expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor_id ON public.expenses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(event_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event_status ON public.tasks(event_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_event_due_date ON public.tasks(event_id, due_date);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON public.task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON public.task_dependencies(depends_on_task_id);
CREATE INDEX IF NOT EXISTS idx_milestones_event_date ON public.event_milestones(event_id, milestone_date);
CREATE INDEX IF NOT EXISTS idx_schedule_items_event_time ON public.event_schedule_items(event_id, start_time, sort_order);
CREATE INDEX IF NOT EXISTS idx_vendors_event_id ON public.vendors(event_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(event_id, category);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(event_id, status);
CREATE INDEX IF NOT EXISTS idx_guests_event_id ON public.guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp ON public.guests(event_id, rsvp_status);
CREATE INDEX IF NOT EXISTS idx_guests_group ON public.guests(event_id, group_name);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_event ON public.ai_conversations(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_created ON public.ai_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_ai_generated_plans_event ON public.ai_generated_plans(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_plans_user ON public.ai_generated_plans(user_id);

-- ============================================================================
-- Step 5: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all 13 tables
ALTER TABLE public.event_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_plans ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 5.1 EVENT PREFERENCES POLICIES (Enforced via parent event ownership)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view preferences for their own events" ON public.event_preferences;
CREATE POLICY "Users can view preferences for their own events"
    ON public.event_preferences FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_preferences.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create preferences for their own events" ON public.event_preferences;
CREATE POLICY "Users can create preferences for their own events"
    ON public.event_preferences FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_preferences.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update preferences for their own events" ON public.event_preferences;
CREATE POLICY "Users can update preferences for their own events"
    ON public.event_preferences FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_preferences.event_id
          AND events.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_preferences.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete preferences for their own events" ON public.event_preferences;
CREATE POLICY "Users can delete preferences for their own events"
    ON public.event_preferences FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_preferences.event_id
          AND events.user_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- 5.2 BUDGET CATEGORIES POLICIES (Enforced via parent event ownership)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view budget categories for their own events" ON public.budget_categories;
CREATE POLICY "Users can view budget categories for their own events"
    ON public.budget_categories FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = budget_categories.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create budget categories for their own events" ON public.budget_categories;
CREATE POLICY "Users can create budget categories for their own events"
    ON public.budget_categories FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = budget_categories.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update budget categories for their own events" ON public.budget_categories;
CREATE POLICY "Users can update budget categories for their own events"
    ON public.budget_categories FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = budget_categories.event_id
          AND events.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = budget_categories.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete budget categories for their own events" ON public.budget_categories;
CREATE POLICY "Users can delete budget categories for their own events"
    ON public.budget_categories FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = budget_categories.event_id
          AND events.user_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- 5.3 VENDORS POLICIES (Enforced via parent event ownership)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view vendors for their own events" ON public.vendors;
CREATE POLICY "Users can view vendors for their own events"
    ON public.vendors FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = vendors.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create vendors for their own events" ON public.vendors;
CREATE POLICY "Users can create vendors for their own events"
    ON public.vendors FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = vendors.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update vendors for their own events" ON public.vendors;
CREATE POLICY "Users can update vendors for their own events"
    ON public.vendors FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = vendors.event_id
          AND events.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = vendors.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete vendors for their own events" ON public.vendors;
CREATE POLICY "Users can delete vendors for their own events"
    ON public.vendors FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = vendors.event_id
          AND events.user_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- 5.4 EXPENSES POLICIES (Enforced via parent event ownership)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view expenses for their own events" ON public.expenses;
CREATE POLICY "Users can view expenses for their own events"
    ON public.expenses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = expenses.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create expenses for their own events" ON public.expenses;
CREATE POLICY "Users can create expenses for their own events"
    ON public.expenses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = expenses.event_id
              AND events.user_id = auth.uid()
        )
        AND (
            expenses.category_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.budget_categories
                WHERE budget_categories.id = expenses.category_id
                  AND budget_categories.event_id = expenses.event_id
            )
        )
        AND (
            expenses.vendor_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.vendors
                WHERE vendors.id = expenses.vendor_id
                  AND vendors.event_id = expenses.event_id
            )
        )
    );

DROP POLICY IF EXISTS "Users can update expenses for their own events" ON public.expenses;
CREATE POLICY "Users can update expenses for their own events"
    ON public.expenses FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = expenses.event_id
          AND events.user_id = auth.uid()
    ))
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = expenses.event_id
              AND events.user_id = auth.uid()
        )
        AND (
            expenses.category_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.budget_categories
                WHERE budget_categories.id = expenses.category_id
                  AND budget_categories.event_id = expenses.event_id
            )
        )
        AND (
            expenses.vendor_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.vendors
                WHERE vendors.id = expenses.vendor_id
                  AND vendors.event_id = expenses.event_id
            )
        )
    );

DROP POLICY IF EXISTS "Users can delete expenses for their own events" ON public.expenses;
CREATE POLICY "Users can delete expenses for their own events"
    ON public.expenses FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = expenses.event_id
          AND events.user_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- 5.5 TASKS POLICIES (Enforced via parent event ownership)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view tasks for their own events" ON public.tasks;
CREATE POLICY "Users can view tasks for their own events"
    ON public.tasks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = tasks.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create tasks for their own events" ON public.tasks;
CREATE POLICY "Users can create tasks for their own events"
    ON public.tasks FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = tasks.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update tasks for their own events" ON public.tasks;
CREATE POLICY "Users can update tasks for their own events"
    ON public.tasks FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = tasks.event_id
          AND events.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = tasks.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete tasks for their own events" ON public.tasks;
CREATE POLICY "Users can delete tasks for their own events"
    ON public.tasks FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = tasks.event_id
          AND events.user_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- 5.6 TASK DEPENDENCIES POLICIES (Both tasks must belong to user's events)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view dependencies for their own tasks" ON public.task_dependencies;
CREATE POLICY "Users can view dependencies for their own tasks"
    ON public.task_dependencies FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.tasks t1
            JOIN public.tasks t2 ON t2.id = task_dependencies.depends_on_task_id
            JOIN public.events e ON e.id = t1.event_id
            WHERE t1.id = task_dependencies.task_id
              AND t2.event_id = t1.event_id
              AND e.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create dependencies for their own tasks" ON public.task_dependencies;
CREATE POLICY "Users can create dependencies for their own tasks"
    ON public.task_dependencies FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.tasks t1
            JOIN public.tasks t2 ON t2.id = task_dependencies.depends_on_task_id
            JOIN public.events e ON e.id = t1.event_id
            WHERE t1.id = task_dependencies.task_id
              AND t2.event_id = t1.event_id
              AND e.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update dependencies for their own tasks" ON public.task_dependencies;
CREATE POLICY "Users can update dependencies for their own tasks"
    ON public.task_dependencies FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks t1
            JOIN public.events e1 ON e1.id = t1.event_id
            WHERE t1.id = task_dependencies.task_id
              AND e1.user_id = auth.uid()
        )
        AND
        EXISTS (
            SELECT 1 FROM public.tasks t2
            JOIN public.events e2 ON e2.id = t2.event_id
            WHERE t2.id = task_dependencies.depends_on_task_id
              AND e2.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.tasks t1
            JOIN public.tasks t2 ON t2.id = task_dependencies.depends_on_task_id
            JOIN public.events e ON e.id = t1.event_id
            WHERE t1.id = task_dependencies.task_id
              AND t2.event_id = t1.event_id
              AND e.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete dependencies for their own tasks" ON public.task_dependencies;
CREATE POLICY "Users can delete dependencies for their own tasks"
    ON public.task_dependencies FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks t1
            JOIN public.events e1 ON e1.id = t1.event_id
            WHERE t1.id = task_dependencies.task_id
              AND e1.user_id = auth.uid()
        )
        AND
        EXISTS (
            SELECT 1 FROM public.tasks t2
            JOIN public.events e2 ON e2.id = t2.event_id
            WHERE t2.id = task_dependencies.depends_on_task_id
              AND e2.user_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- 5.7 EVENT MILESTONES POLICIES (Enforced via parent event ownership)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view milestones for their own events" ON public.event_milestones;
CREATE POLICY "Users can view milestones for their own events"
    ON public.event_milestones FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_milestones.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create milestones for their own events" ON public.event_milestones;
CREATE POLICY "Users can create milestones for their own events"
    ON public.event_milestones FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_milestones.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update milestones for their own events" ON public.event_milestones;
CREATE POLICY "Users can update milestones for their own events"
    ON public.event_milestones FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_milestones.event_id
          AND events.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_milestones.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete milestones for their own events" ON public.event_milestones;
CREATE POLICY "Users can delete milestones for their own events"
    ON public.event_milestones FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_milestones.event_id
          AND events.user_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- 5.8 EVENT SCHEDULE ITEMS POLICIES (Enforced via parent event ownership)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view schedule items for their own events" ON public.event_schedule_items;
CREATE POLICY "Users can view schedule items for their own events"
    ON public.event_schedule_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_schedule_items.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create schedule items for their own events" ON public.event_schedule_items;
CREATE POLICY "Users can create schedule items for their own events"
    ON public.event_schedule_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_schedule_items.event_id
              AND events.user_id = auth.uid()
        )
        AND (
            event_schedule_items.responsible_vendor_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.vendors
                WHERE vendors.id = event_schedule_items.responsible_vendor_id
                  AND vendors.event_id = event_schedule_items.event_id
            )
        )
    );

DROP POLICY IF EXISTS "Users can update schedule items for their own events" ON public.event_schedule_items;
CREATE POLICY "Users can update schedule items for their own events"
    ON public.event_schedule_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_schedule_items.event_id
          AND events.user_id = auth.uid()
    ))
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_schedule_items.event_id
              AND events.user_id = auth.uid()
        )
        AND (
            event_schedule_items.responsible_vendor_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.vendors
                WHERE vendors.id = event_schedule_items.responsible_vendor_id
                  AND vendors.event_id = event_schedule_items.event_id
            )
        )
    );

DROP POLICY IF EXISTS "Users can delete schedule items for their own events" ON public.event_schedule_items;
CREATE POLICY "Users can delete schedule items for their own events"
    ON public.event_schedule_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_schedule_items.event_id
          AND events.user_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- 5.9 GUESTS POLICIES (Enforced via parent event ownership)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view guests for their own events" ON public.guests;
CREATE POLICY "Users can view guests for their own events"
    ON public.guests FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = guests.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create guests for their own events" ON public.guests;
CREATE POLICY "Users can create guests for their own events"
    ON public.guests FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = guests.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update guests for their own events" ON public.guests;
CREATE POLICY "Users can update guests for their own events"
    ON public.guests FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = guests.event_id
          AND events.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = guests.event_id
          AND events.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete guests for their own events" ON public.guests;
CREATE POLICY "Users can delete guests for their own events"
    ON public.guests FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = guests.event_id
          AND events.user_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- 5.10 NOTIFICATIONS POLICIES (Direct user ownership)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND (
            notifications.event_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.events
                WHERE events.id = notifications.event_id
                  AND events.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid()
        AND (
            notifications.event_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.events
                WHERE events.id = notifications.event_id
                  AND events.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.11 AI CONVERSATIONS POLICIES (Direct user ownership & event association)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can view their own AI conversations"
    ON public.ai_conversations FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create AI conversations for their own events" ON public.ai_conversations;
CREATE POLICY "Users can create AI conversations for their own events"
    ON public.ai_conversations FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = ai_conversations.event_id
              AND events.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can update their own AI conversations"
    ON public.ai_conversations FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = ai_conversations.event_id
              AND events.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can delete their own AI conversations"
    ON public.ai_conversations FOR DELETE
    USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.12 AI MESSAGES POLICIES (Inherited from AI conversation ownership)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view messages from their own AI conversations" ON public.ai_messages;
CREATE POLICY "Users can view messages from their own AI conversations"
    ON public.ai_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.ai_conversations
        WHERE ai_conversations.id = ai_messages.conversation_id
          AND ai_conversations.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can insert messages into their own AI conversations" ON public.ai_messages;
CREATE POLICY "Users can insert messages into their own AI conversations"
    ON public.ai_messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.ai_conversations
        WHERE ai_conversations.id = ai_messages.conversation_id
          AND ai_conversations.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update messages in their own AI conversations" ON public.ai_messages;
CREATE POLICY "Users can update messages in their own AI conversations"
    ON public.ai_messages FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.ai_conversations
        WHERE ai_conversations.id = ai_messages.conversation_id
          AND ai_conversations.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.ai_conversations
        WHERE ai_conversations.id = ai_messages.conversation_id
          AND ai_conversations.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete messages from their own AI conversations" ON public.ai_messages;
CREATE POLICY "Users can delete messages from their own AI conversations"
    ON public.ai_messages FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.ai_conversations
        WHERE ai_conversations.id = ai_messages.conversation_id
          AND ai_conversations.user_id = auth.uid()
    ));

-- ----------------------------------------------------------------------------
-- 5.13 AI GENERATED PLANS POLICIES (Direct user ownership & event association)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own AI generated plans" ON public.ai_generated_plans;
CREATE POLICY "Users can view their own AI generated plans"
    ON public.ai_generated_plans FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create AI generated plans for their own events" ON public.ai_generated_plans;
CREATE POLICY "Users can create AI generated plans for their own events"
    ON public.ai_generated_plans FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = ai_generated_plans.event_id
              AND events.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own AI generated plans" ON public.ai_generated_plans;
CREATE POLICY "Users can update their own AI generated plans"
    ON public.ai_generated_plans FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = ai_generated_plans.event_id
              AND events.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own AI generated plans" ON public.ai_generated_plans;
CREATE POLICY "Users can delete their own AI generated plans"
    ON public.ai_generated_plans FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- Step 6: POSTGREST SCHEMA CACHE RELOAD
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- Step 7: POST-MIGRATION VERIFICATION QUERIES
-- ============================================================================

-- 1. Check that all 15 project tables exist in the public schema
SELECT 
    table_name,
    (SELECT count(*) FROM information_schema.columns c WHERE c.table_schema = 'public' AND c.table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles',
    'events',
    'event_preferences',
    'budget_categories',
    'vendors',
    'expenses',
    'tasks',
    'task_dependencies',
    'event_milestones',
    'event_schedule_items',
    'guests',
    'notifications',
    'ai_conversations',
    'ai_messages',
    'ai_generated_plans'
  )
ORDER BY table_name;

-- 2. Verify Row Level Security is enabled on all 15 tables
SELECT 
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'events',
    'event_preferences',
    'budget_categories',
    'vendors',
    'expenses',
    'tasks',
    'task_dependencies',
    'event_milestones',
    'event_schedule_items',
    'guests',
    'notifications',
    'ai_conversations',
    'ai_messages',
    'ai_generated_plans'
  )
ORDER BY tablename;

-- 3. Verify RLS policy counts per table
SELECT 
    tablename, 
    count(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

