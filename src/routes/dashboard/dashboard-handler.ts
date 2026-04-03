
// const { MakeQuery } = require("../../services/model-service");



// //to get getAssetsCount filter

// export const getAssetsCount = async () => {
//     let activeAssetsCount = await AssetMaster.count({ where: { isActive: 1  } });
//     let inactiveAssetscount = await AssetMaster.count({ where: { isActive: 0 } });
//     const count = {
//         activeAssetsCount: activeAssetsCount,
//         inactiveAssetscount: inactiveAssetscount,
//     }
//     return count;
//   }

//   export const getLocationCount = async () => {
//     let activeLocationCount = await LocationMaster.count({ where: { isActive: 1  } });
//     let inactiveLocationcount = await LocationMaster.count({ where: { isActive: 0 } });
//     const count = {
//         activeLocationCount: activeLocationCount,
//         inactiveLocationcount: inactiveLocationcount,
//     }
//     return count;
//   }

//   export const getPieData = async () => {

//     let getLatestData: any = await AssetTrackingDetail.findOne({order: [['id', 'desc']], raw: true});

//     let result = await AssetTracking.findOne({
//         where: {id: getLatestData.assetTrackingId},
//         order: [['id', 'desc']],
//         include: [
//             { 
//                 model: AssetTrackingDetail,
//             }
//         ]
//     });
//     return result;
// };