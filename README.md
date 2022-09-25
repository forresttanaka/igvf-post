# igvf-post

This posts objects of a specific type defined in a tsv file to a running igvfd instance.

## TSV File Objects

The first row of the tsv file comprises the postable property names. Each row below that describes an object to post to the database. For exmaple, for a schema that describes objects like this:

```
[
  {
    "status": "released",
    "lab": "/labs/j-michael-cherry/",
    "viewing_group": "IGVF"
  },
  {
    "status": "in progress",
    "lab": "/labs/j-michael-cherry/",
    "viewing_group": "community"
  }
]
```

...the TSV file would contain:

| status      | lab                     | viewing_group |
| ----------- | ----------------------- | ------------- |
| released    | /labs/j-michael-cherry/ | IGVF          |
| in progress | /labs/j-michael-cherry/ | community     |

## Special Properties

By default, values get treated as strings. But some properties have other types, and each property with a non-string type has a suffix describing the type after the property name.

### Numbers

For properties with the number type, suffix the property name with `-date`.

| status   | lab                     | starting_date-date |
| -------- | ----------------------- | ------------------ |
| released | /labs/j-michael-cherry/ | 1/1/2022           |

All dates get written to the database as YYYY-MM-DD regardless of how they appear in the TSV file.

### Arrays

Append `-array` to all properties with an array type. The values get entered comma separated:

| status   | lab                     | pi-array                                     |
| -------- | ----------------------- | -------------------------------------------- |
| released | /labs/j-michael-cherry/ | /labs/j-michael-cherry/,/labs/ali-mortazavi/ |

The array elements must have a string type. I don’t support arrays of dates for example.
