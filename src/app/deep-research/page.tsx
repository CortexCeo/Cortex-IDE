"use client"

import { MainLayout } from "@/components/layouts/MainLayout"
import { DeepResearchPage } from "@/components/research/deep-research/DeepResearchPage"

export default function DeepResearchRoute() {
  return (
    <MainLayout>
      <DeepResearchPage onClose={() => {}} />
    </MainLayout>
  )
}

