import { IConfig, IAction, IOnInitialize } from 'overmind';
import { state } from './state';
import * as actions from './actions';
import * as effects from './effects';
import { onInitialize } from './init';
import { createHook, createConnect, IConnect } from 'overmind-react';

export const config = {
  onInitialize,
  state,
  actions,
  effects,
  devtools: true
}

type ConfigType = typeof config;

export interface Config extends IConfig<ConfigType> {}

export interface Initializer extends IOnInitialize<Config> {}

export interface Action<Input = void, Output = void | Promise<void>> extends IAction<Config, Input, Output> {}

export interface Connect extends IConnect<ConfigType> {}

export const useOvermind = createHook<ConfigType>();

export const connect = createConnect<ConfigType>();
