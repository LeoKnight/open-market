"use client";

import { useTranslations } from "next-intl";
import { MessageCircle, Phone as PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  whatsapp?: string | null;
  phone?: string | null;
  title: string;
  price: number;
}

export default function WhatsAppButton({ whatsapp, phone, title, price }: WhatsAppButtonProps) {
  const t = useTranslations("Contact");

  if (!whatsapp && !phone) return null;

  const message = encodeURIComponent(
    `Hi, I'm interested in your ${title} listed on Open Market at S$${price.toLocaleString()}. Is it still available?`
  );

  const whatsappNumber = whatsapp?.replace(/[^0-9]/g, "");

  return (
    <div className="space-y-2">
      {whatsapp && (
        <Button asChild className="w-full bg-green-500 hover:bg-green-600" size="lg">
          <a href={`https://wa.me/${whatsappNumber}?text=${message}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" />
            {t("whatsappSeller")}
          </a>
        </Button>
      )}
      {phone && (
        <Button asChild size="lg" className="w-full">
          <a href={`tel:${phone}`}>
            <PhoneIcon className="h-5 w-5" />
            {t("callSeller")}
          </a>
        </Button>
      )}
    </div>
  );
}
