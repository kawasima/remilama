import React from 'react'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.css'

class SettingsMapper {
  constructor() {
    this.registeredHooks = Handsontable.hooks.getRegistered()
  }

  getSettings(properties) {
    let newSettings = {}

    if (properties.settings) {
      let settings = properties.settings
      for (const key in settings) {
        if (settings.hasOwnProperty(key)) {
          newSettings[this.trimHookPrefix(key)] = settings[key]
        }
      }
    }

    for (const key in properties) {
      if (key != 'settings' && properties.hasOwnProperty(key)) {
        newSettings[this.trimHookPrefix(key)] = properties[key]
      }
    }

    return newSettings
  }

  trimHookPrefix(prop) {
    if (prop.indexOf('on') === 0) {
      let hookName = prop.charAt(2).toLowerCase() + prop.slice(3, prop.length)
      if (this.registeredHooks.indexOf(hookName) > -1) {
        return hookName
      }
    }
    return prop
  }
}

export default class HotTable extends React.Component {
  constructor() {
    super()

    this.hotInstance = null
    this.root = null
    this.settingsMapper = new SettingsMapper()
  }

  componentDidMount() {
    const newSettings = this.settingsMapper.getSettings(this.props)
    this.hotInstance = new Handsontable(document.getElementById(this.root), newSettings)
  }

  shouldComponentUpdate(nextProps, nextState) {
    this.updateHot(this.settingsMapper.getSettings(nextProps))
    return false
  }

  componentWillUnmount() {
    this.hotInstance && this.hotInstance.destroy()
  }

  render() {
    this.root = 'hot' + new Date().getTime()
    return <div id={this.root}></div>
  }

  updateHot(newSettings) {
    this.hotInstance.updateSettings(newSettings)
  }
}
