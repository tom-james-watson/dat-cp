const units = ['B', 'KB', 'MB', 'GB']

function getUnit(bytes) {
  return Math.floor(Math.log(bytes) / Math.log(1024))
}

function getUnitLabel(unit) {
  return units[unit]
}

function formatSize(bytes, options={}) {
  const unit = options.unit || getUnit(bytes)

  if (bytes === 0) {
    return options.unit === undefined ? '0B' : '0'
  }

  let size = (bytes / Math.pow(1024, unit)).toFixed(2)

  if (options.unit === undefined) {
    size += getUnitLabel(unit)
  }
  return size
}

export {
  getUnit,
  getUnitLabel,
  formatSize
}
