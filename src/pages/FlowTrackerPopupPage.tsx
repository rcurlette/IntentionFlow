import { useState } from "react";
import { FlowEntry } from "@/types";
import { FlowTrackingPopup } from "@/components/app/FlowTrackingPopup";

export default function FlowTrackerPopupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    entryData: Omit<FlowEntry, "id" | "createdAt">,
  ) => {
    setIsSubmitting(true);

    try {
      // Send data to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "FLOW_ENTRY_SUBMITTED",
            data: entryData,
          },
          window.location.origin,
        );
      }

      // Close popup after short delay
      setTimeout(() => {
        window.close();
      }, 500);
    } catch (error) {
      console.error("Error submitting flow entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "FLOW_POPUP_CLOSED",
        },
        window.location.origin,
      );
    }
    window.close();
  };

  const handleMinimize = () => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "FLOW_POPUP_MINIMIZED",
        },
        window.location.origin,
      );
    }
    window.blur();
  };

  return (
    <FlowTrackingPopup
      onSubmit={handleSubmit}
      onClose={handleClose}
      onMinimize={handleMinimize}
      isSubmitting={isSubmitting}
    />
  );
}
