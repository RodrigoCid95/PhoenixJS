class Flags {
  /**
   * Constructor.
   */
  constructor() {
    const argList = process.argv
    this.args = {}
    let a
    let opt
    let thisOpt
    let curOpt
    for (a = 0; a < argList.length; a++) {
      thisOpt = argList[a].trim()
      opt = thisOpt.replace(/^\-+/, '')
      if (opt === thisOpt) {
        if (curOpt) this.args[curOpt] = opt
        curOpt = null
      } else {
        curOpt = opt
        this.args[curOpt] = true
      }
    }
  }
  /**
   * Look for a convert argument from the command line.
   * @param {string} name Argument name.
   * @returns {string | boolean} Returns the value of a variable.
   */
  get(name) {
    return this.args[name]
  }
}
export const flags = new Flags()