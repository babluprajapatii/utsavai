-- ============================================================================
-- UtsavAI - Standard Development & Demonstration Seed Data
-- Source: docs/13-DATABASE-IMPLEMENTATION-SPECIFICATION.md (Section 28)
-- Intended for local development, testing, and evaluation environments only.
-- ============================================================================

DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
    wedding_id UUID := '11111111-1111-1111-1111-111111111111';
    birthday_id UUID := '22222222-2222-2222-2222-222222222222';
    diwali_id UUID := '33333333-3333-3333-3333-333333333333';
    
    venue_cat_id UUID := gen_random_uuid();
    catering_cat_id UUID := gen_random_uuid();
    decor_cat_id UUID := gen_random_uuid();
    photo_cat_id UUID := gen_random_uuid();
    
    venue_vendor_id UUID := gen_random_uuid();
    catering_vendor_id UUID := gen_random_uuid();
    photo_vendor_id UUID := gen_random_uuid();
    
    task1_id UUID := gen_random_uuid();
    task2_id UUID := gen_random_uuid();
BEGIN
    -- 1. Create Demo User & Profile if not present
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        demo_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'demo@utsavai.local',
        crypt('DemoUser123!', gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Demo Planner"}',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
    VALUES (
        demo_user_id,
        'Demo Planner',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Event 1: Aarav & Diya Wedding Celebration
    INSERT INTO public.events (id, user_id, name, type, status, event_date, start_time, end_time, location, total_budget, currency, guest_count, description)
    VALUES (
        wedding_id,
        demo_user_id,
        'Aarav & Diya Wedding Celebration',
        'Wedding',
        'Active',
        (CURRENT_DATE + INTERVAL '45 days'),
        '10:00:00',
        '23:00:00',
        'The Leela Palace, Bengaluru',
        1500000.00,
        'INR',
        350,
        'Grand 3-day royal wedding celebration featuring Sangeet, Haldi, and Reception.'
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        total_budget = EXCLUDED.total_budget,
        guest_count = EXCLUDED.guest_count;

    -- Event 1 Preferences
    INSERT INTO public.event_preferences (event_id, theme, style, priorities, special_requirements)
    VALUES (
        wedding_id,
        'Royal Heritage & Marigold',
        'Traditional Indian Regal',
        '["Traditional Royal Mandap", "Curated Vegetarian Feast", "Live Shehnai & Classical Sangeet"]'::jsonb,
        'Wheelchair access required for courtyard entrance. Jain food counter designated for lunch.'
    )
    ON CONFLICT (event_id) DO NOTHING;

    -- Event 1 Budget Categories
    INSERT INTO public.budget_categories (id, event_id, name, planned_amount)
    VALUES
        (venue_cat_id, wedding_id, 'Venue & Lawns', 500000.00),
        (catering_cat_id, wedding_id, 'Catering & Beverages', 450000.00),
        (decor_cat_id, wedding_id, 'Floral Decoration & Mandap', 250000.00),
        (photo_cat_id, wedding_id, 'Photography & Videography', 180000.00)
    ON CONFLICT DO NOTHING;

    -- Event 1 Vendors
    INSERT INTO public.vendors (id, event_id, name, category, contact_name, contact_phone, contact_email, quoted_price, agreed_price, status, booking_date, notes)
    VALUES
        (venue_vendor_id, wedding_id, 'The Leela Palace Banquets', 'Venue', 'Rajesh K.', '+91 98765 43210', 'events@theleela.com', 520000.00, 500000.00, 'Booked', CURRENT_DATE - INTERVAL '10 days', 'Includes grand ballroom and pool lawn.'),
        (catering_vendor_id, wedding_id, 'Royal Rasoi Caterers', 'Catering', 'Chef Manjit', '+91 98450 12345', 'info@royalrasoi.com', 480000.00, 450000.00, 'Booked', CURRENT_DATE - INTERVAL '8 days', 'Menu tasting scheduled for this weekend.'),
        (photo_vendor_id, wedding_id, 'Moments by Maya Studios', 'Photography', 'Maya Sen', '+91 99887 65432', 'maya@moments.studio', 200000.00, 180000.00, 'Negotiating', NULL, 'Includes pre-wedding shoot and 2 drone operators.')
    ON CONFLICT DO NOTHING;

    -- Event 1 Expenses
    INSERT INTO public.expenses (event_id, category_id, vendor_id, description, planned_amount, actual_amount, expense_date, notes)
    VALUES
        (wedding_id, venue_cat_id, venue_vendor_id, 'Venue 50% advance booking deposit', 250000.00, 250000.00, CURRENT_DATE - INTERVAL '10 days', 'Receipt #LL-2026-904'),
        (wedding_id, catering_cat_id, catering_vendor_id, 'Catering confirmation advance', 100000.00, 100000.00, CURRENT_DATE - INTERVAL '8 days', 'Direct bank transfer receipt attached'),
        (wedding_id, decor_cat_id, NULL, 'Mandap flower sample design consultation', 15000.00, 15000.00, CURRENT_DATE - INTERVAL '3 days', 'Sample floral arrangement reviewed and approved')
    ON CONFLICT DO NOTHING;

    -- Event 1 Tasks
    INSERT INTO public.tasks (id, event_id, title, description, category, priority, status, due_date, assigned_to)
    VALUES
        (task1_id, wedding_id, 'Finalize Mandap Floral Design', 'Choose marigold and jasmine color palette with decor vendor.', 'Decoration', 'High', 'Completed', (CURRENT_DATE - INTERVAL '2 days'), 'Diya'),
        (task2_id, wedding_id, 'Distribute Digital E-Invitations', 'Send RSVP links via WhatsApp and email to main family list.', 'Communication', 'Critical', 'In Progress', (CURRENT_DATE + INTERVAL '5 days'), 'Aarav'),
        (gen_random_uuid(), wedding_id, 'Confirm Sound & Sangeet Playlist', 'Review audio console and playlist with DJ.', 'Music', 'Medium', 'Not Started', (CURRENT_DATE + INTERVAL '20 days'), 'Cousin Rohan')
    ON CONFLICT DO NOTHING;

    -- Event 1 Task Dependencies
    INSERT INTO public.task_dependencies (task_id, depends_on_task_id)
    VALUES (task2_id, task1_id)
    ON CONFLICT DO NOTHING;

    -- Event 1 Milestones
    INSERT INTO public.event_milestones (event_id, title, milestone_date, description, status)
    VALUES
        (wedding_id, 'Venue & Catering Locked', (CURRENT_DATE - INTERVAL '5 days'), 'All major contracts signed and advances cleared.', 'Completed'),
        (wedding_id, 'Invitations Sent & RSVPs Tracking', (CURRENT_DATE + INTERVAL '10 days'), 'Final headcount cutoff for banquet arrangement.', 'Pending'),
        (wedding_id, 'Final Rehearsal & Vendor Walkthrough', (CURRENT_DATE + INTERVAL '40 days'), 'Detailed venue walkthrough with decor and sound crews.', 'Pending')
    ON CONFLICT DO NOTHING;

    -- Event 1 Day Schedule Items
    INSERT INTO public.event_schedule_items (event_id, activity, start_time, end_time, location, responsible_person, sort_order)
    VALUES
        (wedding_id, 'Baraat Procession & Welcome Ceremony', '10:00:00', '11:30:00', 'Grand Courtyard Entrance', 'Uncle Sharma', 1),
        (wedding_id, 'Varmala & Sacred Mandap Pheras', '11:45:00', '13:30:00', 'Main Royal Mandap Lawn', 'Head Priest & Panditji', 2),
        (wedding_id, 'Royal Banquet Lunch', '13:30:00', '15:30:00', 'Grand Dining Pavilion', 'Royal Rasoi Banquet Captain', 3),
        (wedding_id, 'Evening Reception & Musical Celebrations', '19:00:00', '23:00:00', 'Grand Ballroom', 'Event Master of Ceremonies', 4)
    ON CONFLICT DO NOTHING;

    -- Event 1 Guests
    INSERT INTO public.guests (event_id, name, group_name, email, phone, rsvp_status, plus_one, meal_preference, special_requirements)
    VALUES
        (wedding_id, 'Sunita & Ramesh Gupta', 'Groom Family', 'ramesh.gupta@example.com', '+91 98201 11223', 'Accepted', true, 'Veg', 'Requires ground-floor seating'),
        (wedding_id, 'Priya & Vikram Malhotra', 'Bride Family', 'priya.m@example.com', '+91 98111 22334', 'Accepted', true, 'Jain', NULL),
        (wedding_id, 'Kavita Chawla', 'College Friends', 'kavita.c@example.com', '+91 97333 44556', 'Pending', false, 'Veg', NULL),
        (wedding_id, 'Anil Deshmukh', 'Colleagues', 'anil.d@example.com', '+91 99000 88776', 'Declined', false, 'Non-Veg', NULL)
    ON CONFLICT DO NOTHING;

    -- 3. Event 2: Vikram's 50th Milestone Birthday
    INSERT INTO public.events (id, user_id, name, type, status, event_date, start_time, end_time, location, total_budget, currency, guest_count, description)
    VALUES (
        birthday_id,
        demo_user_id,
        'Vikram''s 50th Milestone Birthday Bash',
        'Birthday',
        'Active',
        (CURRENT_DATE + INTERVAL '20 days'),
        '18:00:00',
        '23:30:00',
        'Skyline Terrace Lounge, Mumbai',
        150000.00,
        'INR',
        60,
        'Surprise golden celebration with close friends, retro music, and family nostalgia slideshow.'
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        total_budget = EXCLUDED.total_budget,
        guest_count = EXCLUDED.guest_count;

    -- Event 2 Schedule
    INSERT INTO public.event_schedule_items (event_id, activity, start_time, end_time, location, responsible_person, sort_order)
    VALUES
        (birthday_id, 'Guest Arrival & Welcome Cocktails', '18:00:00', '19:00:00', 'Rooftop Deck', 'Hostess Ananya', 1),
        (birthday_id, 'Surprise Tribute Video & Memory Speeches', '19:15:00', '20:15:00', 'Lounge Screening Room', 'Rohan (Son)', 2),
        (birthday_id, 'Cake Cutting & Live Retro Band', '20:30:00', '22:00:00', 'Main Stage Area', 'Band Lead', 3),
        (birthday_id, 'Dinner & Desserts Feast', '21:30:00', '23:30:00', 'Terrace Buffet Courtyard', 'Lounge Manager', 4)
    ON CONFLICT DO NOTHING;

    -- 4. Event 3: Shanti Nagar Diwali Community Utsav
    INSERT INTO public.events (id, user_id, name, type, status, event_date, start_time, end_time, location, total_budget, currency, guest_count, description)
    VALUES (
        diwali_id,
        demo_user_id,
        'Shanti Nagar Diwali Community Utsav',
        'Community Event',
        'Planning',
        (CURRENT_DATE + INTERVAL '90 days'),
        '16:00:00',
        '22:00:00',
        'Shanti Nagar Community Grounds & Club House',
        300000.00,
        'INR',
        500,
        'Annual residential community festival featuring rangoli competition, cultural performances, and festive dinner.'
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        total_budget = EXCLUDED.total_budget,
        guest_count = EXCLUDED.guest_count;

    -- Notifications for Demo User
    INSERT INTO public.notifications (user_id, event_id, title, message, type, is_read, created_at)
    VALUES
        (demo_user_id, wedding_id, 'Mandap Floral Design Approved', 'Task "Finalize Mandap Floral Design" was marked completed.', 'task_completed', true, NOW() - INTERVAL '2 days'),
        (demo_user_id, wedding_id, 'RSVP Milestone Cutoff Approaching', '10 days remaining to finalize guest headcounts for banquet lunch.', 'reminder', false, NOW() - INTERVAL '1 hour'),
        (demo_user_id, birthday_id, 'Venue Walkthrough Scheduled', 'Reminder: Skyline Terrace Lounge walkthrough this Friday at 5:00 PM.', 'system', false, NOW() - INTERVAL '3 hours')
    ON CONFLICT DO NOTHING;

END $$;

