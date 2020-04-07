# Magic Legality API

Magic the gather legality checking API. An open set of endpoints that allows users to determin whether or not a set of cards and a format constitutes a legal magic deck.

## Endpoints

Route

```
/legality
```

Example request structure.

```
{
    "method": "POST",
    "body": {
        "commandZone": [
            {"id": "3a1d0dad-18a8-489e-ac11-08f64b72fda4", "quantity": "1"}
        ],
        "mainboard": [
            {"id": "2b72bbd7-0b80-4e12-86d5-494d91319ec4", "quantity": "5"}
        ],
        "sideboard": [
            {"id": "2b72bbd7-0b80-4e12-86d5-494d91319ec4", "quantity": "1"}
        ],
        "format": "edh"
    }
}
```

TODO - clean up the above documentation with allowed formats, simpler structure, etc.

## Building the Project

This project is using [Node 12](). Be sure to have that installed for attempting to run the below commands.

Install all node dependancies.

```
npm install
```

Run the project locally.

```
npm run start
```

From there you can use something like [curl]() or [postman]() to send test requests to the API.
