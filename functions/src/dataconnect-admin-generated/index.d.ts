import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

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

/** Generated Node Admin SDK operation action function for the 'CreateStation' Mutation. Allow users to execute without passing in DataConnect. */
export function createStation(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateStationData>>;
/** Generated Node Admin SDK operation action function for the 'CreateStation' Mutation. Allow users to pass in custom DataConnect instances. */
export function createStation(options?: OperationOptions): Promise<ExecuteOperationResponse<CreateStationData>>;

/** Generated Node Admin SDK operation action function for the 'ListStations' Query. Allow users to execute without passing in DataConnect. */
export function listStations(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListStationsData>>;
/** Generated Node Admin SDK operation action function for the 'ListStations' Query. Allow users to pass in custom DataConnect instances. */
export function listStations(options?: OperationOptions): Promise<ExecuteOperationResponse<ListStationsData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateSong' Mutation. Allow users to execute without passing in DataConnect. */
export function updateSong(dc: DataConnect, vars: UpdateSongVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSongData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateSong' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateSong(vars: UpdateSongVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSongData>>;

/** Generated Node Admin SDK operation action function for the 'ListMyPrograms' Query. Allow users to execute without passing in DataConnect. */
export function listMyPrograms(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyProgramsData>>;
/** Generated Node Admin SDK operation action function for the 'ListMyPrograms' Query. Allow users to pass in custom DataConnect instances. */
export function listMyPrograms(options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyProgramsData>>;

