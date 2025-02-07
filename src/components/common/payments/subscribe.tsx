import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { headers } from "next/headers";
import ButtonAction from "./button-action";

interface SubscribeButtonProps extends VariantProps<typeof Button> {
  label?: string;
  isLoading?: boolean;
}

const SubscribeButton: React.FC<SubscribeButtonProps> = async ({
  label = "Subscribe",
  variant = "default",
  isLoading = false,
}) => {
  const headerList = headers();
  const session = await auth();
  const isNationalSections = session?.user?.role?.name === "National Sections";

  return (
    <ButtonAction
      isNationalSections={isNationalSections}
      email={session?.user.email}
      userId={session?.user.id}
      redirectPath={headerList.get("x-current-path") as string}
      label={label}
      variant={variant}
      isLoading={isLoading}
      customerId={session?.user?.stripeCustomerId!}
    />
  );
};

export default SubscribeButton;
