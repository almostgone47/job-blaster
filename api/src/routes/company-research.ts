import express from 'express';
import prisma from '../prisma';

const router = express.Router();

/**
 * GET /company-research
 * Get all company research for the authenticated user
 */
router.get('/company-research', async (req, res) => {
  const userId = (req as any).userId as string;

  try {
    const research = await prisma.companyResearch.findMany({
      where: {userId},
      orderBy: {updatedAt: 'desc'},
    });

    res.json(research);
  } catch (error) {
    console.error('Failed to fetch company research:', error);
    res.status(500).json({error: 'Failed to fetch company research'});
  }
});

/**
 * GET /company-research/:companyName
 * Get company research for a specific company
 */
router.get('/company-research/:companyName', async (req, res) => {
  const userId = (req as any).userId as string;
  const {companyName} = req.params;

  try {
    const research = await prisma.companyResearch.findUnique({
      where: {
        userId_companyName: {
          userId,
          companyName: decodeURIComponent(companyName),
        },
      },
    });

    if (!research) {
      return res.status(404).json({error: 'Company research not found'});
    }

    res.json(research);
  } catch (error) {
    console.error('Failed to fetch company research:', error);
    res.status(500).json({error: 'Failed to fetch company research'});
  }
});

/**
 * POST /company-research
 * Create or update company research
 */
router.post('/company-research', async (req, res) => {
  const userId = (req as any).userId as string;
  const {companyName, insights, rating, pros, cons} = req.body;

  if (!companyName) {
    return res.status(400).json({error: 'companyName is required'});
  }

  try {
    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({error: 'Rating must be between 1 and 5'});
    }

    const research = await prisma.companyResearch.upsert({
      where: {
        userId_companyName: {
          userId,
          companyName: companyName.trim(),
        },
      },
      update: {
        insights: insights || '',
        rating: rating || null,
        pros: pros || [],
        cons: cons || [],
        updatedAt: new Date(),
      },
      create: {
        userId,
        companyName: companyName.trim(),
        insights: insights || '',
        rating: rating || null,
        pros: pros || [],
        cons: cons || [],
      },
    });

    res.status(201).json(research);
  } catch (error) {
    console.error('Failed to create/update company research:', error);
    res.status(500).json({error: 'Failed to create/update company research'});
  }
});

/**
 * DELETE /company-research/:companyName
 * Delete company research for a specific company
 */
router.delete('/company-research/:companyName', async (req, res) => {
  const userId = (req as any).userId as string;
  const {companyName} = req.params;

  try {
    await prisma.companyResearch.delete({
      where: {
        userId_companyName: {
          userId,
          companyName: decodeURIComponent(companyName),
        },
      },
    });

    res.status(204).end();
  } catch (error) {
    console.error('Failed to delete company research:', error);
    res.status(500).json({error: 'Failed to delete company research'});
  }
});

export default router;
