import {
Body,
Controller,
Get,
Patch,
Req,
UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

interface AuthenticatedRequest extends Request {
user: {
id: string;
email?: string;
};
}

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
constructor(private readonly usersService: UsersService) {}

@Get('me')
getMyProfile(@Req() request: AuthenticatedRequest) {
return this.usersService.getMyProfile(request.user.id);
}

@Patch('me')
updateMyProfile(
@Req() request: AuthenticatedRequest,
@Body() dto: UpdateProfileDto,
) {
return this.usersService.updateMyProfile(request.user.id, dto);
}
}
