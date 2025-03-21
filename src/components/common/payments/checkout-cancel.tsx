"use client";

import { AlertCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";

export default function CheckoutCanceled({
  redirectTo,
}: {
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
            <AlertCircle className="w-16 h-16 text-amber-500" />
          </motion.div>
          <h1 className="text-2xl font-bold mt-4 text-gray-900">
            Transaction Canceled
          </h1>
          <p className="text-gray-500 mt-2">
            Your order has been canceled. No charges have been made to your
            account.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">
                  Why was my transaction canceled?
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  This could be due to:
                </p>
                <ul className="text-sm text-amber-700 list-disc list-inside mt-2">
                  <li>You canceled the transaction</li>
                  <li>Session timeout</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href={redirectTo}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Dashboard
            </Link>
          </Button>
          {/* <Button className="w-full sm:w-auto" variant="secondary">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button> */}
        </CardFooter>
      </Card>
    </div>
  );
}
