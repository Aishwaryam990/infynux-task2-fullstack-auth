import {
Injectable,
NotFoundException,
BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
constructor(private readonly prisma: PrismaService) {}

async getMyProfile(userId: string) {
const user = await this.prisma.user.findUnique({
where: { id: userId },
select: {
id: true,
name: true,
email: true,
createdAt: true,
},
});

if (!user) {
  throw new NotFoundException('User profile not found');
}

return {
  message: 'Profile retrieved successfully',
  user,
};

}

async updateMyProfile(userId: string, dto: UpdateProfileDto) {
const name = dto.name.trim();

if (!name) {
  throw new BadRequestException('Name cannot be empty');
}

if (name.length > 100) {
  throw new BadRequestException(
    'Name must not exceed 100 characters',
  );
}

const existingUser = await this.prisma.user.findUnique({
  where: { id: userId },
  select: { id: true },
});

if (!existingUser) {
  throw new NotFoundException('User profile not found');
}

const user = await this.prisma.user.update({
  where: { id: userId },
  data: { name },
  select: {
    id: true,
    name: true,
    email: true,
    createdAt: true,
  },
});

return {
  message: 'Profile updated successfully',
  user,
};

}
}
