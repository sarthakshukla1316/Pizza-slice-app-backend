class UserDto {
    id;
    phone;
    email;
    name;
    avatar;
    verified;
    createdAt;

    constructor(user) {
        this.id = user._id;
        this.phone = user.phone;
        this.email = user.email;
        this.name = user.name;
        this.avatar = user.avatar;
        this.verified = user.verified;
        this.createdAt = user.createdAt;
    }
}


module.exports = UserDto;