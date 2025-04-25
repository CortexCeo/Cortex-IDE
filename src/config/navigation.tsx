import { Home, Inbox, FolderOpen, FileText, Microscope, Map, Wand2, Puzzle, Bot, Settings, Brain } from "lucide-react"

export const navigationConfig = {
  categories: [
    {
      id: "workspace",
      label: "",
      items: [
        {
          key: "explorer",
          label: "Explorer",
          path: "/explorer",
          icon: <FolderOpen className="h-7 w-7" />,
        },
        {
          key: "deep-research",
          label: "Deep Research",
          path: "/deep-research",
          icon: <Microscope className="h-7 w-7" />,
        },
        {
          key: "maestro",
          label: "Maestro",
          path: "/maestro",
          icon: <Wand2 className="h-7 w-7" />,
        },
        // {
        //   key: "home",
        //   label: "Home",
        //   path: "/home",
        //   icon: <Home className="h-5 w-5" />,
        // },
        // {
        //   key: "inbox",
        //   label: "Inbox",
        //   path: "/inbox",
        //   icon: <Inbox className="h-5 w-5" />,
        // },
        // {
        //   key: "memory",
        //   label: "Memory",
        //   path: "/memory",
        //   icon: <Brain className="h-5 w-5" />,
        // },
      ],
    },
    // {
    //   id: "content",
    //   label: "Content",
    //   items: [
    //     {
    //       key: "explorer",
    //       label: "Explorer",
    //       path: "/explorer",
    //       icon: <FolderOpen className="h-5 w-5" />,
    //     },
    //     {
    //       key: "templates",
    //       label: "Templates",
    //       path: "/templates",
    //       icon: <FileText className="h-5 w-5" />,
    //     },
    //   ],
    // },
    // {
    //   id: "research",
    //   label: "Research",
    //   items: [
    //     {
    //       key: "deep-research",
    //       label: "Deep Research",
    //       path: "/deep-research",
    //       icon: <Microscope className="h-5 w-5" />,
    //     },
    //     // {
    //     //   key: "zone-research",
    //     //   label: "Zone Research",
    //     //   path: "/zone-research",
    //     //   icon: <Map className="h-5 w-5" />,
    //     // },
    //   ],
    // },
    // {
    //   id: "tools",
    //   label: "Tools",
    //   items: [
    //     {
    //       key: "mastero",
    //       label: "Mastero",
    //       path: "/mastero",
    //       icon: <Wand2 className="h-5 w-5" />,
    //     },
    //     {
    //       key: "integrations",
    //       label: "Integrations",
    //       path: "/integrations",
    //       icon: <Puzzle className="h-5 w-5" />,
    //     },
    //     {
    //       key: "assistants",
    //       label: "Assistants",
    //       path: "/assistants",
    //       icon: <Bot className="h-5 w-5" />,
    //     },
    //   ],
    // },
  ],
  bottomItems: [
    {
      key: "settings",
      label: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ],
  mainItems: [
    // {
    //   key: "home",
    //   label: "Home",
    //   path: "/home",
    //   icon: <Home className="h-5 w-5" />,
    // },
    {
      key: "explorer",
      label: "Explorer",
      path: "/explorer",
      icon: <FolderOpen className="h-5 w-5" />,
    },
    // {
    //   key: "memory",
    //   label: "Memory",
    //   path: "/memory",
    //   icon: <Brain className="h-5 w-5" />,
    // },
    // {
    //   key: "templates",
    //   label: "Templates",
    //   path: "/templates",
    //   icon: <FileText className="h-5 w-5" />,
    // },
    {
      key: "deep-research",
      label: "Deep Research",
      path: "/deep-research",
      icon: <Microscope className="h-5 w-5" />,
    },
    // {
    //   key: "zone-research",
    //   label: "Zone Research",
    //   path: "/zone-research",
    //   icon: <Map className="h-5 w-5" />,
    // },
    // {
    //   key: "mastero",
    //   label: "Mastero",
    //   path: "/mastero",
    //   icon: <Wand2 className="h-5 w-5" />,
    // },
    // {
    //   key: "integrations",
    //   label: "Integrations",
    //   path: "/integrations",
    //   icon: <Puzzle className="h-5 w-5" />,
    // },
    // {
    //   key: "assistants",
    //   label: "Assistants",
    //   path: "/assistants",
    //   icon: <Bot className="h-5 w-5" />,
    // },
  ],
}

