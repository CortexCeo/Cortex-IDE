"use client"

import { MainLayout } from "@/components/layouts/MainLayout"
import { FileExplorer } from "@/components/sidebar/FileExplorer"
import { TabBar } from "@/components/tabs/TabBar"
import { ContentContainer } from "@/components/content/ContentContainer"
import { SideChat } from "@/components/sidebar/SideChat"
// import { ConsolePanel } from "@/components/console/ConsolePanel"
 
export default function Home() {
  return (
    <MainLayout>
      <div className="flex h-full">
        <FileExplorer />
        <div className="flex-1 flex flex-col h-full">
          <TabBar />
          <div className="flex-1 flex overflow-hidden">
            <ContentContainer />
            {/* <SideChat /> */}
          </div>
          {/* <ConsolePanel /> */}
        </div>
      </div>
    </MainLayout>
  )
}
