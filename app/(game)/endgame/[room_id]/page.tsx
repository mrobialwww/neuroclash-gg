import { redirect } from "next/navigation";

export default function EndGamePage({
  params,
}: {
  params: Promise<{ room_id: string }>;
}) {
  redirect("/dashboard");
}
