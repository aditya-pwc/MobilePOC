import AccountDM from '../domain/account/AccountDM'
class AccountService {
    public static async getRouteBuId() {
        return await AccountDM.getRouteBuId()
    }

    static getUniqIdsFromRoutes = AccountDM.getUniqIdsFromRoutes
}

export default AccountService
