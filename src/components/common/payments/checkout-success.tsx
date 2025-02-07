"use client";

import { CheckCircle, Home, Receipt } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { createPortalSession } from "@/lib/payments";

export default function CheckoutSuccess({
  children,
  sessionId,
  redirectTo,
}: {
  children: React.ReactNode;
  sessionId: string;
  redirectTo: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="flex justify-center"
          >
            <CheckCircle className="w-16 h-16 text-green-500" />
          </motion.div>
          <h1 className="text-2xl font-bold mt-4 text-gray-900">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 mt-2">
            Thank you for your purchase. Your order has been received and is
            being processed.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
          <Separator />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={() => {
              createPortalSession(sessionId, redirectTo);
            }}
          >
            <Receipt className="w-4 h-4 mr-2" />
            View Order Details
          </Button>
          <Button className="w-full sm:w-auto" variant="secondary" asChild>
            <Link href={redirectTo}>
              <Home className="w-4 h-4 mr-2" />
              Go to the dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
