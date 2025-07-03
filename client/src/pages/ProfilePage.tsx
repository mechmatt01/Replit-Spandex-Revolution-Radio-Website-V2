import Profile from "@/components/Profile";
import { useLocation } from "wouter";

export default function ProfilePage() {
  const [, navigate] = useLocation();

  const handleNavigateToSubscribe = () => {
    navigate("/subscribe");
  };

  return <Profile onNavigateToSubscribe={handleNavigateToSubscribe} />;
}
