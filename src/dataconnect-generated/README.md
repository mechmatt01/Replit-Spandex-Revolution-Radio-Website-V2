# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListStations*](#liststations)
  - [*ListMyPrograms*](#listmyprograms)
- [**Mutations**](#mutations)
  - [*CreateStation*](#createstation)
  - [*UpdateSong*](#updatesong)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListStations
You can execute the `ListStations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listStations(): QueryPromise<ListStationsData, undefined>;

interface ListStationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListStationsData, undefined>;
}
export const listStationsRef: ListStationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listStations(dc: DataConnect): QueryPromise<ListStationsData, undefined>;

interface ListStationsRef {
  ...
  (dc: DataConnect): QueryRef<ListStationsData, undefined>;
}
export const listStationsRef: ListStationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listStationsRef:
```typescript
const name = listStationsRef.operationName;
console.log(name);
```

### Variables
The `ListStations` query has no variables.
### Return Type
Recall that executing the `ListStations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListStationsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListStationsData {
  stations: ({
    id: UUIDString;
    name: string;
    slogan: string;
  } & Station_Key)[];
}
```
### Using `ListStations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listStations } from '@dataconnect/generated';


// Call the `listStations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listStations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listStations(dataConnect);

console.log(data.stations);

// Or, you can use the `Promise` API.
listStations().then((response) => {
  const data = response.data;
  console.log(data.stations);
});
```

### Using `ListStations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listStationsRef } from '@dataconnect/generated';


// Call the `listStationsRef()` function to get a reference to the query.
const ref = listStationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listStationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.stations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.stations);
});
```

## ListMyPrograms
You can execute the `ListMyPrograms` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyPrograms(): QueryPromise<ListMyProgramsData, undefined>;

interface ListMyProgramsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyProgramsData, undefined>;
}
export const listMyProgramsRef: ListMyProgramsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyPrograms(dc: DataConnect): QueryPromise<ListMyProgramsData, undefined>;

interface ListMyProgramsRef {
  ...
  (dc: DataConnect): QueryRef<ListMyProgramsData, undefined>;
}
export const listMyProgramsRef: ListMyProgramsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyProgramsRef:
```typescript
const name = listMyProgramsRef.operationName;
console.log(name);
```

### Variables
The `ListMyPrograms` query has no variables.
### Return Type
Recall that executing the `ListMyPrograms` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyProgramsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMyProgramsData {
  programs: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    dayOfWeek: string;
    startTime: TimestampString;
    endTime: TimestampString;
    hostName?: string | null;
  } & Program_Key)[];
}
```
### Using `ListMyPrograms`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyPrograms } from '@dataconnect/generated';


// Call the `listMyPrograms()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyPrograms();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyPrograms(dataConnect);

console.log(data.programs);

// Or, you can use the `Promise` API.
listMyPrograms().then((response) => {
  const data = response.data;
  console.log(data.programs);
});
```

### Using `ListMyPrograms`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyProgramsRef } from '@dataconnect/generated';


// Call the `listMyProgramsRef()` function to get a reference to the query.
const ref = listMyProgramsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyProgramsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.programs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.programs);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateStation
You can execute the `CreateStation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createStation(): MutationPromise<CreateStationData, undefined>;

interface CreateStationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateStationData, undefined>;
}
export const createStationRef: CreateStationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createStation(dc: DataConnect): MutationPromise<CreateStationData, undefined>;

interface CreateStationRef {
  ...
  (dc: DataConnect): MutationRef<CreateStationData, undefined>;
}
export const createStationRef: CreateStationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createStationRef:
```typescript
const name = createStationRef.operationName;
console.log(name);
```

### Variables
The `CreateStation` mutation has no variables.
### Return Type
Recall that executing the `CreateStation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateStationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateStationData {
  station_insert: Station_Key;
}
```
### Using `CreateStation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createStation } from '@dataconnect/generated';


// Call the `createStation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createStation();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createStation(dataConnect);

console.log(data.station_insert);

// Or, you can use the `Promise` API.
createStation().then((response) => {
  const data = response.data;
  console.log(data.station_insert);
});
```

### Using `CreateStation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createStationRef } from '@dataconnect/generated';


// Call the `createStationRef()` function to get a reference to the mutation.
const ref = createStationRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createStationRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.station_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.station_insert);
});
```

## UpdateSong
You can execute the `UpdateSong` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateSong(vars: UpdateSongVariables): MutationPromise<UpdateSongData, UpdateSongVariables>;

interface UpdateSongRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSongVariables): MutationRef<UpdateSongData, UpdateSongVariables>;
}
export const updateSongRef: UpdateSongRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateSong(dc: DataConnect, vars: UpdateSongVariables): MutationPromise<UpdateSongData, UpdateSongVariables>;

interface UpdateSongRef {
  ...
  (dc: DataConnect, vars: UpdateSongVariables): MutationRef<UpdateSongData, UpdateSongVariables>;
}
export const updateSongRef: UpdateSongRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateSongRef:
```typescript
const name = updateSongRef.operationName;
console.log(name);
```

### Variables
The `UpdateSong` mutation requires an argument of type `UpdateSongVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateSongVariables {
  id: UUIDString;
  album?: string | null;
}
```
### Return Type
Recall that executing the `UpdateSong` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateSongData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateSongData {
  song_update?: Song_Key | null;
}
```
### Using `UpdateSong`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateSong, UpdateSongVariables } from '@dataconnect/generated';

// The `UpdateSong` mutation requires an argument of type `UpdateSongVariables`:
const updateSongVars: UpdateSongVariables = {
  id: ..., 
  album: ..., // optional
};

// Call the `updateSong()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateSong(updateSongVars);
// Variables can be defined inline as well.
const { data } = await updateSong({ id: ..., album: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateSong(dataConnect, updateSongVars);

console.log(data.song_update);

// Or, you can use the `Promise` API.
updateSong(updateSongVars).then((response) => {
  const data = response.data;
  console.log(data.song_update);
});
```

### Using `UpdateSong`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateSongRef, UpdateSongVariables } from '@dataconnect/generated';

// The `UpdateSong` mutation requires an argument of type `UpdateSongVariables`:
const updateSongVars: UpdateSongVariables = {
  id: ..., 
  album: ..., // optional
};

// Call the `updateSongRef()` function to get a reference to the mutation.
const ref = updateSongRef(updateSongVars);
// Variables can be defined inline as well.
const ref = updateSongRef({ id: ..., album: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateSongRef(dataConnect, updateSongVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.song_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.song_update);
});
```

