import { CreateStationData, ListStationsData, UpdateSongData, UpdateSongVariables, ListMyProgramsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateStation(options?: useDataConnectMutationOptions<CreateStationData, FirebaseError, void>): UseDataConnectMutationResult<CreateStationData, undefined>;
export function useCreateStation(dc: DataConnect, options?: useDataConnectMutationOptions<CreateStationData, FirebaseError, void>): UseDataConnectMutationResult<CreateStationData, undefined>;

export function useListStations(options?: useDataConnectQueryOptions<ListStationsData>): UseDataConnectQueryResult<ListStationsData, undefined>;
export function useListStations(dc: DataConnect, options?: useDataConnectQueryOptions<ListStationsData>): UseDataConnectQueryResult<ListStationsData, undefined>;

export function useUpdateSong(options?: useDataConnectMutationOptions<UpdateSongData, FirebaseError, UpdateSongVariables>): UseDataConnectMutationResult<UpdateSongData, UpdateSongVariables>;
export function useUpdateSong(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateSongData, FirebaseError, UpdateSongVariables>): UseDataConnectMutationResult<UpdateSongData, UpdateSongVariables>;

export function useListMyPrograms(options?: useDataConnectQueryOptions<ListMyProgramsData>): UseDataConnectQueryResult<ListMyProgramsData, undefined>;
export function useListMyPrograms(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyProgramsData>): UseDataConnectQueryResult<ListMyProgramsData, undefined>;
