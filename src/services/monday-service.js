require('dotenv').config();
const initMondayClient = require('monday-sdk-js');
const token = process.env.TOKEN;

// fetch the columnIds and their items
const moveDuplicateItems = async (data) => {
  const { boardId, columnIds, groupId } = data;
  const mondayClient = initMondayClient({ token });
  const query = `query {
    boards(ids: ${boardId}) {
      id
      name
      items_page {
        items {
          id
          name
          group{
            id
          }
          column_values(ids:["${columnIds[0]}", "${columnIds[1]}", "status" ]) {
            id
            type
            text
            value
          }
        }
      }
    }
  }`;

  const response = await mondayClient.api(query);
  const items = response.data.boards[0].items_page.items;
  const matchingItemIDs = findItemsWithMatchingTextValues(items);

  matchingItemIDs.forEach((itemId) => {

    const move_item = `move_item_to_group(item_id: "${itemId}", group_id: "${groupId}"){id}`;
    const query = `mutation { ${move_item} }`;

    mondayClient.api(query)
      .then((response) => {
        // GraphQL query to fetch current column settings
        const query =
          ` mutation change_column_value($board_id: ID!, $item_id: ID!, $column_id: String!, $value: JSON!) {
            change_column_value(board_id: $board_id,item_id: $item_id, column_id: $column_id, create_labels_if_missing:true, value: $value) {
            id
            }
          }`
        mondayClient.api(query, { variables: { "board_id": boardId, "item_id": itemId, "column_id": "status", "value": "{\"label\":\"Duplicate\"}" } })
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));

  })

}

function findItemsWithMatchingTextValues(items) {
  const valueMap = {}; // Object to track text occurrences: { textValue: [itemIDs] }

  // First pass to build the map of text values to item IDs
  items.forEach(item => {
    item.column_values.forEach(column => {
      const textValue = column.text; // Using 'text' as the value of interest
      if (textValue) {
        if (!valueMap[textValue]) {
          valueMap[textValue] = [];
        }
        valueMap[textValue].push(item.id); // Assuming item.name as a unique identifier (proxy for ID)
      }
    });
  });

  // Second pass to find all unique item IDs that have matching text values
  const matchingItemIDs = new Set();
  Object.values(valueMap).forEach(ids => {
    if (ids.length > 1) { // If the text value occurs in more than one item
      ids.forEach(id => matchingItemIDs.add(id));
    }
  });

  return Array.from(matchingItemIDs);
}

module.exports = {
  moveDuplicateItems
};
