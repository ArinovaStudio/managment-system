export const clientDemoData = {
  dashboard: {
    projectProgress: 72, // percentage

    latestUpdates: [
      {
        id: 1,
        title: "API integration completed",
        date: "2025-03-02",
      },
      {
        id: 2,
        title: "UI Design approved",
        date: "2025-02-27",
      },
      {
        id: 3,
        title: "Backend security audit finished",
        date: "2025-02-25",
      },
    ],

    workDone: [
      {
        id: 1,
        task: "Authentication System Setup",
        completedOn: "2025-02-20",
      },
      {
        id: 2,
        task: "Project Dashboard UI Created",
        completedOn: "2025-02-22",
      },
      {
        id: 3,
        task: "MongoDB Schema Design",
        completedOn: "2025-02-24",
      },
    ],

    projectInfo: {
      projectName: "Client Management System",
      budget: "₹80,000",
      clientName: "Aritra Enterprises",
      type: "Web Application",
      startDate: "2025-02-01",
      deadline: "2025-04-15",
    },

    documents: [
      {
        id: 1,
        title: "UI Mockups",
        type: "PDF",
        url: "/docs/ui-mockups.pdf",
      },
      {
        id: 2,
        title: "Project Requirements",
        type: "PDF",
        url: "/docs/project-requirements.pdf",
      },
      {
        id: 3,
        title: "API Contracts",
        type: "PDF",
        url: "/docs/api-contracts.pdf",
      },
    ],
  },

  feedback: [
    {
      id: 1,
      type: "project",
      message: "The dashboard UI looks clean. Please add dark mode.",
      date: "2025-03-01",
    },
    {
      id: 2,
      type: "normal",
      message: "Response time is very good.",
      date: "2025-02-26",
    },
    {
      id: 3,
      type: "project",
      message: "Please also include an activity timeline.",
      date: "2025-02-20",
    },
  ],

  meetRequests: [
    {
      id: 1,
      reason: "Discuss new dashboard features",
      date: "2025-03-08",
      time: "4:00 PM",
      duration: "45 minutes",
      status: "pending",
      meetLink: ""
    },
    {
      id: 2,
      reason: "Review API performance",
      date: "2025-03-10",
      time: "11:00 AM",
      duration: "30 minutes",
      status: "approved",
      meetLink: "https://meet.example.com/meet-48291-AZX"
    },
  ],

  featureRequests: [
    {
      id: 1,
      title: "Add real-time notifications",
      description: "Implement a live notification system for project updates, messages, and deadlines.",
      date: "2025-03-01",
      status:"pending"
    },
    {
      id: 2,
      title: "Add download invoices option",
      description: "Provide users with the ability to view and download monthly or per-project invoices.",
      date: "2025-02-25",
      status:"approved"
    },
    {
      id: 3,
      title: "Provide mobile responsive dashboard",
      description: "Optimize the dashboard layout and components for seamless mobile usage.",
      date: "2025-02-27",
      status:"rejected"
    },
  ]

};
