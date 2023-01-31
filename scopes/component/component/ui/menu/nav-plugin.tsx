import { SlotRegistry } from '@teambit/harmony';
import type { LinkProps } from '@teambit/base-react.navigation.link';
import type { ConsumeMethod } from '@teambit/ui-foundation.ui.use-box.menu';
import { ChangeType } from '@teambit/component.ui.component-compare.models.component-compare-change-type';
import { LaneModel } from '@teambit/lanes.ui.models.lanes-model';
import { ComponentModel } from '../../ui';

export type NavPluginProps = {
  displayName?: string;
  ignoreQueryParams?: boolean;
} & LinkProps;

export type NavPlugin = {
  props: NavPluginProps;
  order?: number;
  changeType?: ChangeType;
};

export type OrderedNavigationSlot = SlotRegistry<NavPlugin>;
export type ConsumePluginOptions = {
  currentLane?: LaneModel;
};

export type ConsumePlugin = (
  componentModel: ComponentModel,
  options?: ConsumePluginOptions
) => ConsumeMethod | undefined;

export type ConsumeMethodSlot = SlotRegistry<ConsumePlugin[]>;
