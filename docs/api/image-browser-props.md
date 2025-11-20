---
title: ImageBrowserProps API
description: "API Reference | ImageBrowserProps"
api_reference: true
slug: api_imagebrowserprops
---

# ImageBrowserProps

Configuration interface for the Image Browser feature in Pantanal Editor. The Image Browser allows users to browse, upload, and select images from a server with thumbnail preview support.

## Props

### fileTypes `String`

Defines the allowed file extensions. Multiple extensions should be comma-separated.

```typescript
{
  fileTypes: 'gif,jpg,jpeg,png,svg,webp'
}
```

### path `String`

Defines the initial folder that will be displayed in relation to the root.

```typescript
{
  path: '/images'
}
```

### transport `ImageBrowserTransport`

Configuration object for image operations (read, upload, destroy, create).

#### transport.read `ImageBrowserReadTransport`

Options or URL for remote image retrieval.

```typescript
{
  transport: {
    read: {
      url: '/api/images/list',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: { path: '/images' }
    }
  }
}
```

##### transport.read.url `String | Function`

The remote URL that will be called when the list of items is fetched.

##### transport.read.type `String`

The type of request that will be made (`POST`, `GET`, `PUT`, or `DELETE`). Defaults to `POST`.

##### transport.read.dataType `String`

The type of data that is expected by the server to return. Common values: `json`, `jsonp`, `xml`, `html`, `text`.

##### transport.read.contentType `String`

The content-type HTTP header that is sent to the server. If the content is JSON, use `application/json`.

##### transport.read.data `Object | String | Function`

The data that will be sent to the server.

#### transport.upload `ImageBrowserUploadTransport`

The URL which will handle the upload of new images. If not specified, the **Upload** button will not be displayed.

```typescript
{
  transport: {
    upload: {
      url: '/api/images/upload'
    }
  }
}
```

##### transport.upload.url `String`

The URL which will handle the upload of new images.

#### transport.imageUrl `String | Function`

The URL that is responsible for serving the original image. If you use a file-name placeholder, you are required to specify it. By default, the placeholder value is URL-encoded.

```typescript
{
  transport: {
    imageUrl: '/api/images/{0}' // {0} will be replaced with the file name
  }
}
```

Or as a function:

```typescript
{
  transport: {
    imageUrl: (path: string, fileName: string) => {
      return `/api/images${path}/${encodeURIComponent(fileName)}`;
    }
  }
}
```

#### transport.thumbnailUrl `String | Function`

The URL for retrieving the thumbnail version of the image. If not specified, a default image icon will be displayed.

```typescript
{
  transport: {
    thumbnailUrl: '/api/images/thumbnails/{0}'
  }
}
```

Or as a function:

```typescript
{
  transport: {
    thumbnailUrl: (path: string, fileName: string) => {
      return `/api/images/thumbnails${path}/${encodeURIComponent(fileName)}`;
    }
  }
}
```

#### transport.destroy `ImageBrowserDestroyTransport`

The options or URL which will handle the deletion of images and directories. If not specified, the **Delete** button will not be displayed.

```typescript
{
  transport: {
    destroy: {
      url: '/api/images/delete',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    }
  }
}
```

##### transport.destroy.url `String | Function`

The remote URL that will be called when an image is deleted.

##### transport.destroy.type `String`

The type of request (`POST`, `GET`, `PUT`, or `DELETE`). Defaults to `POST`.

##### transport.destroy.dataType `String`

The type of data expected from the server (`json`, `jsonp`, etc.).

##### transport.destroy.contentType `String`

The content-type HTTP header. Defaults to `application/x-www-form-urlencoded`. Use `application/json` for JSON.

##### transport.destroy.data `Object | String | Function`

The data that will be sent to the server.

#### transport.create `ImageBrowserCreateTransport`

The options or URL which will handle the creation of directories. If not specified, the **Create new folder** button will not be displayed.

```typescript
{
  transport: {
    create: {
      url: '/api/images/create',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    }
  }
}
```

##### transport.create.url `String | Function`

The remote URL that will be called when a new directory is created.

##### transport.create.type `String`

The type of request (`POST`, `GET`, `PUT`, or `DELETE`). Defaults to `POST`.

##### transport.create.dataType `String`

The type of data expected from the server.

##### transport.create.contentType `String`

The content-type HTTP header.

##### transport.create.data `Object | String | Function`

The data that will be sent to the server.

### schema `ImageBrowserSchema`

Configuration for parsing the server response.

```typescript
{
  schema: {
    model: {
      id: 'id',
      fields: {
        name: { field: 'name' },
        type: { field: 'type' },
        size: { field: 'size' }
      }
    }
  }
}
```

#### schema.model.id `String`

The name of the field which acts as an identifier.

#### schema.model.fields.name `ImageBrowserField`

The field which contains the name of the image or directory.

##### schema.model.fields.name.field `String`

The name of the field.

##### schema.model.fields.name.parse `Function`

Specifies the function which will parse the field value.

#### schema.model.fields.type `ImageBrowserField`

The field which contains the type of the entry. Supported values:
- `f` - Specifies a file
- `d` - Specifies a directory

##### schema.model.fields.type.field `String`

The name of the field.

##### schema.model.fields.type.parse `Function`

Specifies the function which will parse the field value.

#### schema.model.fields.size `ImageBrowserField`

The field which contains the size of image.

##### schema.model.fields.size.field `String`

The name of the field.

##### schema.model.fields.size.parse `Function`

Specifies the function which will parse the field value.

### messages `ImageBrowserMessages`

Custom messages for the image browser UI.

```typescript
{
  messages: {
    uploadFile: 'Upload',
    orderBy: 'Order by',
    orderByName: 'Name',
    orderBySize: 'Size',
    directoryNotFound: 'Directory not found',
    emptyFolder: 'This folder is empty',
    deleteFile: 'Are you sure you want to delete "{0}"?',
    invalidFileType: 'The selected file "{0}" is not valid. Supported file types are {1}.',
    overwriteFile: 'A file with name "{0}" already exists. Do you want to overwrite it?',
    search: 'Search...'
  }
}
```

#### messages.uploadFile `String`

Defines the text for the **Upload** button.

#### messages.orderBy `String`

Defines the text for **Order by label**.

#### messages.orderByName `String`

Defines the text for **Name item of order by drop-down list**.

#### messages.orderBySize `String`

Defines the text for **Size item of order by drop-down list**.

#### messages.directoryNotFound `String`

Defines the text for the error that occurs when the dialog for not finding a directory is displayed.

#### messages.emptyFolder `String`

Defines the text that is displayed when a folder does not contain items.

#### messages.deleteFile `String`

Defines the text for the dialog that is displayed when an image or directory is deleted. Use `{0}` as placeholder for the file name.

#### messages.invalidFileType `String`

Defines the text for the dialog that is displayed when an invalid file is set for upload. Use `{0}` for file name and `{1}` for allowed types.

#### messages.overwriteFile `String`

Defines the text for the dialog that is displayed when an already existing file is set for upload. Use `{0}` as placeholder for the file name.

#### messages.search `String`

Defines the text for the search-box placeholder.

## Complete Example

```vue
<script setup>
import { ref } from 'vue';
import { PantanalEditor, type ImageBrowserProps } from '@pantanal/editor';

const content = ref('');

const imageBrowser: ImageBrowserProps = {
  fileTypes: 'gif,jpg,jpeg,png,svg,webp',
  path: '/images',
  transport: {
    read: {
      url: '/api/images/list',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: { path: '/images' }
    },
    upload: {
      url: '/api/images/upload'
    },
    imageUrl: (path, fileName) => {
      return `/api/images${path}/${encodeURIComponent(fileName)}`;
    },
    thumbnailUrl: (path, fileName) => {
      return `/api/images/thumbnails${path}/${encodeURIComponent(fileName)}`;
    },
    destroy: {
      url: '/api/images/delete',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    },
    create: {
      url: '/api/images/create',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json'
    }
  },
  schema: {
    model: {
      id: 'id',
      fields: {
        name: { field: 'name' },
        type: { field: 'type' },
        size: { field: 'size' }
      }
    }
  },
  messages: {
    uploadFile: 'Upload Image',
    search: 'Search images...'
  }
};
</script>

<template>
  <PantanalEditor 
    v-model="content" 
    :image-browser="imageBrowser"
  />
</template>
```

## Server Response Format

The server should return data in the following format:

```json
{
  "data": [
    {
      "id": "1",
      "name": "photo1.jpg",
      "type": "f",
      "size": 102400,
      "path": "/images"
    },
    {
      "id": "2",
      "name": "subfolder",
      "type": "d",
      "path": "/images"
    }
  ],
  "total": 2
}
```

## Suggested Links

- [PantanalEditor API](/api/pantanal-editor)
- [ImageBrowser Component](/api/image-browser)
- [Examples](/examples/image-browser)




