"use client";
import { useMemo, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import { MenuItem, SelectedMenuLang } from "@/types/customization";

import MenuItemComponent from "./menu-item";

interface MenuEditorProps {
  menu: SelectedMenuLang[];
  handleChangeOrder: (index: number, destination: number) => void;
  handleSave: (item: SelectedMenuLang) => void;
  handleRemove: (menuId: number, body: MenuItem) => void;
}

function MenuEditor(props: MenuEditorProps) {
  const { handleChangeOrder, menu, handleSave, handleRemove } = props;

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (result.destination && typeof result.destination?.index !== "number")
        return;

      handleChangeOrder(result.source.index, result.destination?.index ?? 0);
    },
    [handleChangeOrder]
  );

  const items = useMemo(
    () =>
      menu.map((item, index) => (
        <Draggable
          key={item.name}
          draggableId={String(item.name)}
          index={index}
        >
          {(provided) => (
            <MenuItemComponent
              handleRemove={handleRemove}
              handleSave={handleSave}
              initialContent={item}
              {...provided}
            />
          )}
        </Draggable>
      )),
    [menu, handleRemove, handleSave]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="menu" direction="vertical">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-col gap-4"
          >
            {items}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default MenuEditor;
