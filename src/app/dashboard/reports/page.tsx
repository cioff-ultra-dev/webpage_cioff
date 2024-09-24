import {
  getAllNationalSections,
  LangWithNationalSection,
} from "@/db/queries/national-sections";
import DashboardReportPage from "./tabs";

export default async function DashboardPage() {
  const nationalSections: LangWithNationalSection[] =
    await getAllNationalSections();
  return <DashboardReportPage nationalSections={nationalSections} />;
}
