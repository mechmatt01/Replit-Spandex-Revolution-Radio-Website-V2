import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateStationData {
  station_insert: Station_Key;
}

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

export interface ListStationsData {
  stations: ({
    id: UUIDString;
    name: string;
    slogan: string;
  } & Station_Key)[];
}

export interface Program_Key {
  id: UUIDString;
  __typename?: 'Program_Key';
}

export interface Schedule_Key {
  id: UUIDString;
  __typename?: 'Schedule_Key';
}

export interface Song_Key {
  id: UUIDString;
  __typename?: 'Song_Key';
}

export interface Station_Key {
  id: UUIDString;
  __typename?: 'Station_Key';
}

export interface UpdateSongData {
  song_update?: Song_Key | null;
}

export interface UpdateSongVariables {
  id: UUIDString;
  album?: string | null;
}

interface CreateStationRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateStationData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateStationData, undefined>;
  operationName: string;
}
export const createStationRef: CreateStationRef;

export function createStation(): MutationPromise<CreateStationData, undefined>;
export function createStation(dc: DataConnect): MutationPromise<CreateStationData, undefined>;

interface ListStationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListStationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListStationsData, undefined>;
  operationName: string;
}
export const listStationsRef: ListStationsRef;

export function listStations(): QueryPromise<ListStationsData, undefined>;
export function listStations(dc: DataConnect): QueryPromise<ListStationsData, undefined>;

interface UpdateSongRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSongVariables): MutationRef<UpdateSongData, UpdateSongVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSongVariables): MutationRef<UpdateSongData, UpdateSongVariables>;
  operationName: string;
}
export const updateSongRef: UpdateSongRef;

export function updateSong(vars: UpdateSongVariables): MutationPromise<UpdateSongData, UpdateSongVariables>;
export function updateSong(dc: DataConnect, vars: UpdateSongVariables): MutationPromise<UpdateSongData, UpdateSongVariables>;

interface ListMyProgramsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyProgramsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyProgramsData, undefined>;
  operationName: string;
}
export const listMyProgramsRef: ListMyProgramsRef;

export function listMyPrograms(): QueryPromise<ListMyProgramsData, undefined>;
export function listMyPrograms(dc: DataConnect): QueryPromise<ListMyProgramsData, undefined>;

