// Hand-written stand-in for the schema in supabase/migrations/0001_init.sql.
// Once a Supabase project is linked, replace this file by running:
//   npx supabase gen types typescript --linked > src/lib/supabase/types.ts
//
// Shape follows @supabase/postgrest-js's GenericSchema contract: every table
// needs Row/Insert/Update/Relationships, and the schema needs Tables/Views/
// Functions, or the client's query builder silently degenerates to `never`.

export type UserRole = "patient" | "responder" | "clinician" | "admin";
export type AllergySeverity = "mild" | "moderate" | "severe";
export type HoldStatus = "pending" | "fulfilled" | "expired" | "cancelled";
export type BloodGroup =
  | "O+"
  | "O-"
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "unknown";

export type EmergencySnapshot = {
  blood_group: BloodGroup;
  allergies: {
    substance: string;
    severity: AllergySeverity;
    reaction_notes: string | null;
  }[];
  chronic_conditions: {
    condition_name: string;
    notes: string | null;
  }[];
  ice_contacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
};

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type ProfileRow = {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

type PassportRow = {
  id: string;
  user_id: string;
  qr_token: string;
  blood_group: BloodGroup;
  weight_kg: number | null;
  height_cm: number | null;
  national_health_id: string | null;
  created_at: string;
  updated_at: string;
};

type AllergyRow = {
  id: string;
  passport_id: string;
  substance: string;
  severity: AllergySeverity;
  reaction_notes: string | null;
  created_at: string;
};

type ChronicConditionRow = {
  id: string;
  passport_id: string;
  condition_name: string;
  notes: string | null;
  created_at: string;
};

type IceContactRow = {
  id: string;
  passport_id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
  created_at: string;
};

type ClinicalRecordRow = {
  id: string;
  passport_id: string;
  diagnosis_history: unknown;
  prescriptions: unknown;
  lab_results: unknown;
  doctor_notes: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type AccessAuditLogRow = {
  id: string;
  passport_id: string;
  accessed_by: string | null;
  tier: 1 | 2;
  accessed_at: string;
  metadata: unknown;
};

type PharmacyRow = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  created_at: string;
};

type MedicationHoldRow = {
  id: string;
  passport_id: string;
  pharmacy_id: string;
  medication_name: string;
  status: HoldStatus;
  held_until: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Partial<ProfileRow> & { id: string; full_name: string }
      >;
      passports: Table<
        PassportRow,
        Partial<PassportRow> & { user_id: string; blood_group: BloodGroup }
      >;
      allergies: Table<
        AllergyRow,
        Partial<AllergyRow> & { passport_id: string; substance: string }
      >;
      chronic_conditions: Table<
        ChronicConditionRow,
        Partial<ChronicConditionRow> & {
          passport_id: string;
          condition_name: string;
        }
      >;
      ice_contacts: Table<
        IceContactRow,
        Partial<IceContactRow> & {
          passport_id: string;
          name: string;
          relationship: string;
          phone: string;
        }
      >;
      clinical_records: Table<
        ClinicalRecordRow,
        Partial<ClinicalRecordRow> & { passport_id: string }
      >;
      access_audit_log: Table<
        AccessAuditLogRow,
        Partial<AccessAuditLogRow> & { passport_id: string; tier: 1 | 2 }
      >;
      pharmacies: Table<
        PharmacyRow,
        Partial<PharmacyRow> & {
          name: string;
          address: string;
          lat: number;
          lng: number;
        }
      >;
      medication_holds: Table<
        MedicationHoldRow,
        Partial<MedicationHoldRow> & {
          passport_id: string;
          pharmacy_id: string;
          medication_name: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      get_emergency_snapshot: {
        Args: { p_token: string };
        Returns: EmergencySnapshot | null;
      };
      check_allergy_contraindication: {
        Args: { p_passport_id: string; p_medication: string };
        Returns: {
          substance: string;
          severity: AllergySeverity;
          reaction_notes: string | null;
        }[];
      };
    };
  };
};
