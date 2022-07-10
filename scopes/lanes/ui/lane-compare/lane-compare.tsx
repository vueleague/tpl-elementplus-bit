import React, {useState} from 'react';
import classnames from 'classnames';
import { ComponentModel, useComponent } from '@teambit/component';
import { ComponentCompare } from '@teambit/component.ui.compare';
import { Link, LinkProps } from '@teambit/base-react.navigation.link';
import { RouteSlot, SlotRouter } from '@teambit/ui-foundation.ui.react-router.slot-router';
import { DrawerUI } from '@teambit/ui-foundation.ui.tree.drawer';
import { ComponentProvider, ComponentDescriptorProvider } from '@teambit/component';
import { SlotRegistry } from '@teambit/harmony';
import {
    LaneDetails,
    useLanesContext,
    useLaneComponents,
    LaneModel,
    LanesModel,
    LanesHost,
  } from '@teambit/lanes.ui.lanes';
// import { styles } from '@teambit/graph/ui/component-node';
import styles from './lane-compare.module.scss';




  
export type LanesNavPlugin = {
    props: LinkProps;
    order: number;
    hide?: () => boolean;
  };
  export type LanesOrderedNavigationSlot = SlotRegistry<LanesNavPlugin[]>;

export type LaneCompareProps = {
    routeSlot?: RouteSlot;
    host?: LanesHost;
    navSlot?: LanesOrderedNavigationSlot;
    ComponentCompare?: React.ReactNode;
  };

export function LaneCompare({/* routeSlot, host, navSlot, */ ComponentCompare}: LaneCompareProps) {
    const lanesContext = useLanesContext();
  const currentLane = lanesContext?.viewedLane;
  if(!currentLane) return null;
  // const { loading, components } = useLaneComponents(currentLane);
  // if(!components) return null;
  console.log("comps", currentLane.components)
    return (
        <div className={styles.laneCompare}>
          <div>

            {`showing components for lane ${currentLane.id}`}
            {currentLane.components?.map( component => {
              // const componentId = component.id.toString()
              return (
                <CompoenentWrapper component={component} /* routeSlot={routeSlot} */ ComponentCompare={ComponentCompare} />
                )
              })}
          </div>
        </div>
    )
}

function CompoenentWrapper({component, routeSlot, ComponentCompare}: {component: ComponentModel, routeSlot?: RouteSlot, ComponentCompare: React.ReactNode}) {
  const comp = useComponent('teambit.workspace/workspace', component.id.toString())
  const [isOpen, setOpenDrawer] = useState(false);
  const componentId = component.id.toString()
  console.log("comp.component", comp.component)
  if(!comp.component) return null;
  return (
    <ComponentProvider component={comp.component}>
        <ComponentDescriptorProvider componentDescriptor={comp.componentDescriptor}>
          <DrawerUI isOpen={isOpen} onToggle={() => setOpenDrawer(!isOpen)} className={styles.componentCompareDrawer} contentClass={classnames(styles.drawerContent, isOpen && styles.openDrawer)} name={<div /* href={componentId} */>{componentId}</div>}>
            {ComponentCompare}
            </DrawerUI>
        </ComponentDescriptorProvider>
    </ComponentProvider>
  )
}