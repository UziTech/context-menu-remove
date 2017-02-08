This package adds a few methods to [atom.contextMenu](https://atom.io/docs/api/latest/ContextMenuManager) and allows you to specify commands to remove from the context menu in a similar way to adding commands

## Usage

There are two ways you can remove context menu items with this package:

1. Use `atom.contextMenu.remove()` in your init script

  ```coffeescript
   atom.contextMenu.remove {
     "atom-text-editor": [
       "Undo",
       "Redo",
       {
         label: "Tabs to spaces",
         submenu: [
           "Tabify",
           "Untabify",
           "Untabify All"
         ]
       }
     ]
   }
  ```

2. Add the object to your config file under the "remove" setting

  ```coffeescript
   "*":
     "context-menu-remove":
       remove:
         "atom-text-editor": [
           "Undo",
           "Redo",
           {
             label: "Tabs to spaces",
             submenu: [
               "Tabify",
               "Untabify",
               "Untabify All"
             ]
           }
         ]
  ```

## Format

The format is similar to [atom.contextMenu.add](https://atom.io/docs/api/v1.13.1/ContextMenuManager#instance-add) with a few exceptions.

The only properties that are used are `label` and `submenu`.

If the item does not have a submenu then you can use the `label` property of just use a string.
```coffeescript
{ label: "Undo" } === "Undo"
```

If the you want to remove an item that has a submenu you must list all submenu items.
```coffeescript
{
  label: "Tabs to spaces",
  submenu: [
    #"Tabify", #leave Tabify in menu
    "Untabify",
    "Untabify All"
  ]
}
```

## Methods

These are the extra methods that are added to `atom.contextMenu`

### .remove(itemsBySelector)

This will remove items from the context menu using the format described above.

### .SelectorsForLabel(label)

This will list the selectors that have a label as a top level or submenu item. This is good for debugging.

### .labelsFromElement(element)

This will list the items for a given element. This helps when removing multiple items from an element's context menu.
