"use client";

import KanbanTab from "./KanbanTab";
import OverviewTab from "./OverviewTab";
import WorkDoneTab from "./WorkDoneTab";
import TeamTab from "./TeamTab";
import MilestoneTab from "./MilestoneTab";
import AssetsTab from "./AssetsTab";
import StatusTab from "./StatusTab";
import TicketsTab from "./TicketsTab";
import ReportIssueTab from "./ReportIssueTab";
import UsefulTipsTab from "./TipsTab";

export default function TabContent({ activeTab, project }: any) {

  switch (activeTab) {
    case "Overview":
      return <OverviewTab project={project} />;

    case "Work Done":
      return <WorkDoneTab projectId={project.id} />;

    case "Kanban":
      return <KanbanTab projectId={project.id} />;

    case "Team":
      return <TeamTab projectId={project.id} />;

    case "Milestones":
      return <MilestoneTab projectId={project.id} />;

    case "Assets":
      return <AssetsTab projectId={project.id} />;

    case "Progress":
      return <StatusTab projectId={project.id} />;

    case "Tickets":
      return <TicketsTab projectId={project.id} />;

    case "Report Issue":
      return <ReportIssueTab projectId={project.id} />;

    case "Tips":
      return <UsefulTipsTab projectId={project.id} />;

    // default:
    //   return <OverviewTab project={project} />;
  }
}
