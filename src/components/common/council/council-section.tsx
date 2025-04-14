import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { CouncilSector } from "./council-sector";
import { CHAIRPERSONS, EXECUTIVES, REPRESENTATIVE } from "./constants";

function CouncilSection() {
  const translations = useTranslations("internationalPage");

  const { chairpersons, executives, representative } = useMemo(
    () => ({
      chairpersons: CHAIRPERSONS.map((item) => ({
        ...item,
        description: translations(item.description),
      })),
      executives: EXECUTIVES.map((item) => ({
        ...item,
        description: translations(item.description),
      })),
      representative: REPRESENTATIVE.map((item) => ({
        ...item,
        description: translations(item.description),
      })),
    }),
    [translations]
  );

  return (
    <div className="w-2/3">
      <CouncilSector
        title={translations("executive")}
        councils={executives.map((item) => ({
          ...item,
          description: translations(item.description),
        }))}
      />
      <CouncilSector
        title={translations("sector")}
        councils={representative}
        classes="mt-24"
      />
      <CouncilSector
        title={translations("commissions")}
        councils={chairpersons}
        classes="mt-24"
      />
    </div>
  );
}

export default CouncilSection;
