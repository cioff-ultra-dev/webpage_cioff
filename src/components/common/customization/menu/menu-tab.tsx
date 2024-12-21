import { useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuItem, SelectedMenuLang } from "@/types/customization";
import {
  createMenuItem,
  removeMenuItem,
  updateMenuItem,
  updateMenuPositions,
} from "@/lib/menu";
import { Locale } from "@/i18n/config";

import MenuEditor from "./menu-editor";

function MenuTab({
  locale,
  menu,
}: {
  locale: Locale;
  menu: SelectedMenuLang[];
}) {
  const [menuItems, setMenu] = useState<SelectedMenuLang[]>([]);

  const router = useRouter();
  const translations = useTranslations("customization");

  useEffect(() => {
    setMenu(menu);
  }, [menu]);

  const handleChangeOrder = useCallback(
    async (index: number, destination: number) => {
      const items = Array.from(menuItems);
      const [reorderedItem] = items.splice(index, 1);

      items.splice(destination, 0, reorderedItem);

      const updatedPositions = items.map((item, i) => ({
        ...item,
        menu: { ...item.menu, order: i },
      }));

      setMenu(updatedPositions);
      await updateMenuPositions(
        updatedPositions.map((item) => item.menu).filter((item) => !!item.id)
      );
    },
    [menuItems]
  );

  const addItem = useCallback(() => {
    if (menuItems.length >= 6) {
      toast.warning(translations("menu.maxItems"));

      return;
    }

    const menuItem: SelectedMenuLang = {
      name: translations("menu.newItem"),
      menu: {
        slug: "",
        order: menuItems.length,
      },
    };

    setMenu([...menuItems, menuItem]);
  }, [menuItems, translations]);

  const saveMenuItem = useCallback(
    async (item: SelectedMenuLang) => {
      try {
        if (!item?.id) {
          await createMenuItem(item, locale);

          toast.success(translations("menu.added"));
        } else {
          await updateMenuItem(item, locale);

          toast.success(translations("menu.updated"));
        }

        router.refresh();
      } catch (e) {
        console.error(e);
      }
    },
    [locale, router, translations]
  );

  const handleRemove = useCallback(
    async (menuId: number, body: MenuItem) => {
      try {
        if (menuId === 0) {
          setMenu(
            menuItems.filter(
              (item) => item.name !== body.name && item.menu.slug !== body.slug
            )
          );
        } else {
          await removeMenuItem(menuId);
        }

        toast.success(translations("menu.removed"));
        router.refresh();
      } catch (error) {
        console.error("Error deleting menu item:", error);

        toast.error(translations("menu.notRemoved"));
      }
    },
    [translations, router, menuItems]
  );

  return (
    <TabsContent value="menu">
      <Card>
        <CardHeader className="w-full flex justify-between flex-row">
          <div>
            <CardTitle>{translations("tabs.menu")}</CardTitle>
            <CardDescription>
              {translations("menu.description")}
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 gap-1"
            onClick={addItem}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              {translations("menu.addItem")}
            </span>
          </Button>
        </CardHeader>
        <CardContent className="mt-4 min-h-96 grid grid-cols-1">
          <MenuEditor
            menu={menuItems}
            handleSave={saveMenuItem}
            handleChangeOrder={handleChangeOrder}
            handleRemove={handleRemove}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default MenuTab;
