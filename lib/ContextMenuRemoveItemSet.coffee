module.exports =
class ContextMenuRemoveItemSet
  constructor: (@selector, items) ->
    @items = items.map (item) -> toItem(item)

toItem = (item) ->
  item = { label: item } if typeof item is "string"

  item.submenu = item.submenu.map((submenuItem) -> toItem(submenuItem)) if item.submenu?

  item
