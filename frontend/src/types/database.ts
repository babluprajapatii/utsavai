/**
-- ============================================================================
-- UtsavAI - Supabase Database TypeScript Definitions
-- Source: docs/13-DATABASE-IMPLEMENTATION-SPECIFICATION.md
-- ============================================================================
*/

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EventType =
  | 'Wedding'
  | 'Birthday'
  | 'Community Event'
  | 'Family Celebration'
  | 'Custom Event';

export type EventStatus = 'Planning' | 'Active' | 'Completed' | 'Cancelled';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export type MilestoneStatus = 'Pending' | 'Completed' | 'Overdue';

export type VendorCategory =
  | 'Venue'
  | 'Catering'
  | 'Photography'
  | 'Decoration'
  | 'Music'
  | 'Transportation'
  | 'Security'
  | 'Entertainment'
  | 'Other';

export type VendorStatus =
  | 'Researching'
  | 'Shortlisted'
  | 'Contacted'
  | 'Negotiating'
  | 'Booked'
  | 'Completed'
  | 'Cancelled';

export type GuestRsvpStatus = 'Pending' | 'Accepted' | 'Declined';

export type AiMessageRole = 'user' | 'assistant' | 'system';

export type AiPlanStatus = 'Draft' | 'Accepted' | 'Discarded';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: EventType;
          description: string | null;
          event_date: string;
          start_time: string | null;
          end_time: string | null;
          location: string | null;
          guest_count: number | null;
          total_budget: number | null;
          currency: string;
          status: EventStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: EventType;
          description?: string | null;
          event_date: string;
          start_time?: string | null;
          end_time?: string | null;
          location?: string | null;
          guest_count?: number | null;
          total_budget?: number | null;
          currency?: string;
          status?: EventStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: EventType;
          description?: string | null;
          event_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          location?: string | null;
          guest_count?: number | null;
          total_budget?: number | null;
          currency?: string;
          status?: EventStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      event_preferences: {
        Row: {
          id: string;
          event_id: string;
          theme: string | null;
          style: string | null;
          priorities: Json | null;
          special_requirements: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          theme?: string | null;
          style?: string | null;
          priorities?: Json | null;
          special_requirements?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          theme?: string | null;
          style?: string | null;
          priorities?: Json | null;
          special_requirements?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_preferences_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: true;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      budget_categories: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          planned_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          planned_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          planned_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'budget_categories_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      vendors: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          category: VendorCategory;
          contact_name: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          website: string | null;
          quoted_price: number | null;
          agreed_price: number | null;
          status: VendorStatus;
          booking_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          category: VendorCategory;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          website?: string | null;
          quoted_price?: number | null;
          agreed_price?: number | null;
          status?: VendorStatus;
          booking_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          category?: VendorCategory;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          website?: string | null;
          quoted_price?: number | null;
          agreed_price?: number | null;
          status?: VendorStatus;
          booking_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vendors_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      expenses: {
        Row: {
          id: string;
          event_id: string;
          category_id: string | null;
          vendor_id: string | null;
          description: string;
          planned_amount: number | null;
          actual_amount: number;
          expense_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          category_id?: string | null;
          vendor_id?: string | null;
          description: string;
          planned_amount?: number | null;
          actual_amount?: number;
          expense_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          category_id?: string | null;
          vendor_id?: string | null;
          description?: string;
          planned_amount?: number | null;
          actual_amount?: number;
          expense_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'expenses_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expenses_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'budget_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expenses_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          event_id: string;
          title: string;
          description: string | null;
          category: string | null;
          priority: TaskPriority;
          status: TaskStatus;
          due_date: string | null;
          assigned_to: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_date?: string | null;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_date?: string | null;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      task_dependencies: {
        Row: {
          id: string;
          task_id: string;
          depends_on_task_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          depends_on_task_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          depends_on_task_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'task_dependencies_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'task_dependencies_depends_on_task_id_fkey';
            columns: ['depends_on_task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
        ];
      };
      event_milestones: {
        Row: {
          id: string;
          event_id: string;
          title: string;
          milestone_date: string;
          description: string | null;
          status: MilestoneStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          title: string;
          milestone_date: string;
          description?: string | null;
          status?: MilestoneStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          title?: string;
          milestone_date?: string;
          description?: string | null;
          status?: MilestoneStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_milestones_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      event_schedule_items: {
        Row: {
          id: string;
          event_id: string;
          activity: string;
          start_time: string;
          end_time: string | null;
          description: string | null;
          location: string | null;
          responsible_person: string | null;
          responsible_vendor_id: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          activity: string;
          start_time: string;
          end_time?: string | null;
          description?: string | null;
          location?: string | null;
          responsible_person?: string | null;
          responsible_vendor_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          activity?: string;
          start_time?: string;
          end_time?: string | null;
          description?: string | null;
          location?: string | null;
          responsible_person?: string | null;
          responsible_vendor_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_schedule_items_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_schedule_items_responsible_vendor_id_fkey';
            columns: ['responsible_vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      guests: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          group_name: string | null;
          email: string | null;
          phone: string | null;
          rsvp_status: GuestRsvpStatus;
          plus_one: boolean;
          meal_preference: string | null;
          special_requirements: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          group_name?: string | null;
          email?: string | null;
          phone?: string | null;
          rsvp_status?: GuestRsvpStatus;
          plus_one?: boolean;
          meal_preference?: string | null;
          special_requirements?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          group_name?: string | null;
          email?: string | null;
          phone?: string | null;
          rsvp_status?: GuestRsvpStatus;
          plus_one?: boolean;
          meal_preference?: string | null;
          special_requirements?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'guests_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          event_id: string | null;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id?: string | null;
          type: string;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_conversations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_conversations_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: AiMessageRole;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: AiMessageRole;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: AiMessageRole;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'ai_conversations';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_generated_plans: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          plan_data: Json;
          model: string;
          status: AiPlanStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          plan_data: Json;
          model?: string;
          status?: AiPlanStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          plan_data?: Json;
          model?: string;
          status?: AiPlanStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_generated_plans_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_generated_plans_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

