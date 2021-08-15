/// <reference path="./_references.d.ts" />

import { HTMLElementType } from "./DataTypes";
import { Subscription } from "./Subscription";
import { UIManager } from "./UIManager";
import { $id, isChecked, setChecked } from "./Utils";

export interface HTMLSubscriptionSettingConfig {
  update: (subscriptionSetting: HTMLSubscriptionSetting) => void;
  setUpChangeCallback?: (subscriptionSetting: HTMLSubscriptionSetting) => void;
  getHTMLValue?: (subscriptionSetting: HTMLSubscriptionSetting) => Object;
}

export class HTMLSubscriptionManager {
  subscriptionSettings: HTMLSubscriptionSetting[] = [];
  manager: UIManager;
  configByElementType: { [key: number]: HTMLSubscriptionSettingConfig } = {};

  getChangeCallback(setting: HTMLSubscriptionSetting): any {
    return function() {
      try {
        var val = setting.config.getHTMLValue(setting);
        if (val == null) {
          return;
        }
        setting.manager.subscription["set" + setting.id](val);
        setting.manager.refreshFilteringAndSorting();
      } catch (e) {
        console.log(e);
      }
    };
  }

  constructor(manager: UIManager) {
    this.manager = manager;
    this.configByElementType[HTMLElementType.SelectBox] = {
      setUpChangeCallback: subscriptionSetting => {
        $id(subscriptionSetting.htmlId).change(
          this.getChangeCallback(subscriptionSetting)
        );
      },
      getHTMLValue: subscriptionSetting => {
        return $id(subscriptionSetting.htmlId).val();
      },
      update: subscriptionSetting => {
        var value = this.manager.subscription["get" + subscriptionSetting.id]();
        $id(subscriptionSetting.htmlId).val(value);
      }
    };
    this.configByElementType[HTMLElementType.CheckBox] = {
      setUpChangeCallback: subscriptionSetting => {
        $id(subscriptionSetting.htmlId).change(
          this.getChangeCallback(subscriptionSetting)
        );
      },
      getHTMLValue: subscriptionSetting => {
        return isChecked($id(subscriptionSetting.htmlId));
      },
      update: subscriptionSetting => {
        var value = this.manager.subscription["is" + subscriptionSetting.id]();
        setChecked(subscriptionSetting.htmlId, value);
      }
    };
    this.configByElementType[HTMLElementType.NumberInput] = {
      setUpChangeCallback: subscriptionSetting => {
        var callback = this.getChangeCallback(subscriptionSetting);
        $id(subscriptionSetting.htmlId)[0].oninput = ev => {
          callback();
        };
      },
      getHTMLValue: subscriptionSetting => {
        return Number($id(subscriptionSetting.htmlId).val());
      },
      update: this.configByElementType[HTMLElementType.SelectBox].update
    };
    this.configByElementType[HTMLElementType.ColorInput] = {
      setUpChangeCallback: subscriptionSetting => {
        var callback = this.getChangeCallback(subscriptionSetting);
        const e = $id(subscriptionSetting.htmlId)[0];
        e.oninput = ev => {
          callback();
        };
        e.onchange = e.oninput;
      },
      getHTMLValue: this.configByElementType[HTMLElementType.SelectBox]
        .getHTMLValue,
      update: subscriptionSetting => {
        var value = this.manager.subscription["get" + subscriptionSetting.id]();
        const jq = $id(subscriptionSetting.htmlId);
        jq.val(value);
        if (!subscriptionSetting["jscolor"]) {
          subscriptionSetting["jscolor"] = true;
          new jscolor(jq[0]);
        }
      }
    };
  }

  registerSettings(
    ids: string[],
    type: HTMLElementType,
    subscriptionSettingConfig?: HTMLSubscriptionSettingConfig
  ) {
    this.addSettings(
      ids,
      this.configByElementType[type],
      subscriptionSettingConfig
    );
  }

  registerSelectBoxBoolean(
    id: string,
    getValueCallback: (subscription: Subscription) => any
  ) {
    this.registerSettings([id], HTMLElementType.SelectBox, {
      update: (subscriptionSetting: HTMLSubscriptionSetting) => {
        $id(subscriptionSetting.htmlId).val(
          getValueCallback(subscriptionSetting.manager.subscription) + ""
        );
      },
      getHTMLValue: subscriptionSetting => {
        return $id(subscriptionSetting.htmlId).val() === "true";
      }
    });
  }

  addSettings(
    ids: string[],
    config: HTMLSubscriptionSettingConfig,
    subscriptionSettingConfig?: HTMLSubscriptionSettingConfig
  ) {
    ids.forEach(id => {
      var setting = new HTMLSubscriptionSetting(
        this.manager,
        id,
        config,
        subscriptionSettingConfig
      );
      this.subscriptionSettings.push(setting);
    });
  }

  setUpCallbacks() {
    this.subscriptionSettings.forEach(subscriptionSetting => {
      subscriptionSetting.setUpCallbacks();
    });
  }

  update() {
    this.subscriptionSettings.forEach(subscriptionSetting => {
      subscriptionSetting.update();
    });
  }
}

export class HTMLSubscriptionSetting {
  id: string;
  htmlId: string;
  config: HTMLSubscriptionSettingConfig;
  manager: UIManager;

  constructor(
    manager: UIManager,
    id: string,
    config: HTMLSubscriptionSettingConfig,
    subscriptionSettingConfig?: HTMLSubscriptionSettingConfig
  ) {
    this.manager = manager;
    this.id = id;
    this.htmlId = manager.getHTMLId(id);
    var getHTMLValue, update;
    if (subscriptionSettingConfig != null) {
      getHTMLValue = subscriptionSettingConfig.getHTMLValue;
      update = subscriptionSettingConfig.update;
    }
    getHTMLValue = getHTMLValue == null ? config.getHTMLValue : getHTMLValue;
    update = update == null ? config.update : update;

    this.config = {
      setUpChangeCallback: config.setUpChangeCallback,
      getHTMLValue: getHTMLValue,
      update: update
    };
  }

  update() {
    this.config.update(this);
  }

  setUpCallbacks() {
    this.config.setUpChangeCallback(this);
  }
}
