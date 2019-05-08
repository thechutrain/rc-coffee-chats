export type UserRecord = {
  id: number;
  email: string;
  full_name: string;
  coffee_days: string; // NOTE: or the enum days?
  warning_notification: boolean;
  skip_next_match: boolean;
  is_active: boolean;
  is_faculty: boolean;
  is_admin: boolean;
};
