function LogFormat(method: String, path: String): String{
    return `${new Date()} ${method} ${path}`
}
module.exports = LogFormat