import { MarkConfig } from '../base/base.js';
import { Instance, InstanceType } from './instanceModels.js';
import { parseInstances } from './instanceParser.js';

const types = [
  InstanceType.TEXT,
  InstanceType.SHAPE,
  InstanceType.IMAGE,
  InstanceType.CONTAINER,
];

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
    [InstanceType.TEXT]: { backgroundColor: 'rgb(141, 141, 141)', borderColor: 'black', color: '#FFF' },
    [InstanceType.IMAGE]: { backgroundColor: 'rgba(255, 32, 188, 1)', borderColor: 'black', color: '#FFF' },
    [InstanceType.SHAPE]: { backgroundColor: 'rgba(0, 251, 255, 1)', borderColor: 'black', color: '#FFF' },
    [InstanceType.CONTAINER]: { backgroundColor: 'rgba(45, 45, 255, 1)', borderColor: 'black', color: '#FFF' },
  },
  nextType: (prev) => {
    const index = types.indexOf(prev.type);
    const type = types[(index + 1) % types.length];
    return { ...prev, type };
  },
};
