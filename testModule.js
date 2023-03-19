let currentTime = new Date('2023-02-16T09:29:00.000+00:00')
console.log(currentTime)

let timeOnly = currentTime.getTime()
console.log(timeOnly)

let timeMinus7 = timeOnly - 60000 * 60 * 7

let formatTimeToUTC = new Date(timeMinus7)
console.log(formatTimeToUTC)

function formatTime(){
    let currentTime = new Date('2023-02-16T09:29:00.000+00:00')
    let timeOnly = currentTime.getTime()
    let timeMinus7 = timeOnly - 60000 * 60 * 7
    return new Date(timeMinus7)
}