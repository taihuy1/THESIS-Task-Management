const bcrypt = require('bcrypt');
const { prisma } = require('../src/lib/prisma');

async function main() {
    console.log('seeding...');
    const pw = await bcrypt.hash('seed1223', 10);

    const authors = [
        { email: 'prof.vondrak@university.edu', name: 'Prof. Vondrak', role: 'AUTHOR' },
        { email: 'manager.smith@company.com', name: 'Manager Smith', role: 'AUTHOR' }
    ];
    const solvers = [
        { email: 'tai.huy@student.edu', name: 'Tai Huy Le', role: 'SOLVER' },
        { email: 'anna.novak@student.edu', name: 'Anna Novak', role: 'SOLVER' },
        { email: 'pavel.kovar@student.edu', name: 'Pavel Kovar', role: 'SOLVER' },
        { email: 'lucie.horova@student.edu', name: 'Lucie Horova', role: 'SOLVER' }
    ];

    for (const u of [...authors, ...solvers]) {
        const exists = await prisma.user.findUnique({ where: { email: u.email } });
        if (exists) {
            await prisma.user.update({
                where: { email: u.email },
                data: { password: pw, name: u.name, role: u.role }
            });
        } else {
            await prisma.user.create({ data: { ...u, password: pw } });
        }
    }
    console.log('users done');

    const prof = await prisma.user.findUnique({ where: { email: 'prof.vondrak@university.edu' } });
    const smith = await prisma.user.findUnique({ where: { email: 'manager.smith@company.com' } });
    const tai = await prisma.user.findUnique({ where: { email: 'tai.huy@student.edu' } });
    const anna = await prisma.user.findUnique({ where: { email: 'anna.novak@student.edu' } });
    const pavel = await prisma.user.findUnique({ where: { email: 'pavel.kovar@student.edu' } });

}

main()
    .catch((e) => { console.error('seed error:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
