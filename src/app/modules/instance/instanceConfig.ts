import { MarkConfig } from '../base/base.js';
import { Instance, InstanceType } from './instanceModels.js';
import { parseInstances } from './instanceParser.js';

export const instanceConfig: MarkConfig<Instance> = {
  type: 'instance',
  parse: parseInstances,
  titles: {
    [InstanceType.TEXT]: '文字',
    [InstanceType.IMAGE]: '图片',
    [InstanceType.SHAPE]: '形状',
    [InstanceType.CONTAINER]: '容器',
  },
  colors: {
    [InstanceType.TEXT]: {
      backgroundColor: 'rgb(141, 141, 141)',
      borderColor: 'rgb(96, 96, 96)',
      color: '#FFF',
    },
    [InstanceType.IMAGE]: {
      backgroundColor: 'rgba(255, 32, 188, 1)',
      borderColor: 'rgb(192, 0, 134)',
      color: '#FFF',
    },
    [InstanceType.SHAPE]: {
      backgroundColor: 'rgba(0, 251, 255, 1)',
      borderColor: 'rgb(0, 148, 151)',
      color: '#FFF',
    },
    [InstanceType.CONTAINER]: {
      backgroundColor: 'rgba(45, 45, 255, 1)',
      borderColor: 'rgb(0, 0, 173)',
      color: '#FFF',
    },
  },
  types: [
    InstanceType.TEXT,
    InstanceType.SHAPE,
    InstanceType.IMAGE,
    InstanceType.CONTAINER,
  ],
  nextType: (prev) => {
    const types = instanceConfig.types;
    const index = types.indexOf(prev.type);
    const type = types[(index + 1) % types.length];
    return { ...prev, type };
  },
};
