import { JoinForm } from "./join-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Join Bhuk Foods",
  description:
    "Sign up for Bhuk Foods — home-style monthly meal plan delivered in Agarpara. ₹2,600 / month for 26 days × 2 meals.",
};

export default function JoinPage() {
  return <JoinForm />;
}
