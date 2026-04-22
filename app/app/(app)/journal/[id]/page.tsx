"use client";

import * as React from "react";
import { TopBar } from "@/components/shell/TopBar";
import { JournalEditor } from "@/components/journal/JournalEditor";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function JournalEntryPage({ params, searchParams }: PageProps) {
  const { id } = React.use(params);
  const sp = React.use(searchParams);
  const editParam = sp.edit;
  const initialEdit = editParam === "1" || editParam === "true";

  return (
    <>
      <TopBar
        breadcrumb={[
          { label: "Дневник" },
          { label: "Запись", active: true },
        ]}
      />
      <JournalEditor entryId={id} initialEdit={initialEdit} />
    </>
  );
}
