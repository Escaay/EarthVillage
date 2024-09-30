// import {useSyncExternalStore} from 'react'
// let store = 0
// let callbacks: any[] = []
// const runCallbacks = () => {
//     callbacks.forEach(callback => callback())
// }
// export default {
//     setValue: (val: number) => {
//         store = val
//         console.log(store)
//         runCallbacks()
//     },
//     subscribe: (callback: any) => {
//         callbacks.push(callback)
//         return () => {
//             callbacks = callbacks.filter((item: any) => item !== callback)
//         }
//     },
//     snapshot: () => {
//         return store
//     }
// }
