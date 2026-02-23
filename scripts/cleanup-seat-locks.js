const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupExpiredSeatLocks() {
  try {
    console.log('🧹 Starting cleanup of expired seat locks...');
    
    const now = new Date();
    
    // Update expired locks to inactive
    const result = await prisma.seatlocks.updateMany({
      where: {
        is_active: true,
        expires_at: {
          lt: now
        }
      },
      data: {
        is_active: false,
        updated_at: now
      }
    });

    console.log(`✅ Updated ${result.count} expired seat locks to inactive`);

    // Log details of expired locks for debugging
    const expiredLocks = await prisma.seatlocks.findMany({
      where: {
        is_active: false,
        updated_at: now
      },
      include: {
        seats: {
          select: {
            seat_row: true,
            seat_number: true,
            rooms: {
              select: {
                room_name: true,
                cinemas: {
                  select: {
                    cinema_name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (expiredLocks.length > 0) {
      console.log('📋 Details of expired locks:');
      expiredLocks.forEach(lock => {
        const seat = lock.seats;
        console.log(`  - Seat ${seat?.seat_row}${seat?.seat_number} at ${seat?.rooms?.cinemas?.cinema_name} - Room ${seat?.rooms?.room_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error cleaning up expired seat locks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupExpiredSeatLocks()
    .then(() => {
      console.log('🎉 Seat lock cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seat lock cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupExpiredSeatLocks };
