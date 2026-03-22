import { AlertBlock } from "@/components/ui/alert-block";

export function ModuleErrorState({ message }: { message: string }) {
  return <AlertBlock tone="error" title="Something went wrong" message={message} />;
}
