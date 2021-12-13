#ifndef __AFLV_H
#define __AFLV_H

#include <vector>

#include "llvm/IR/BasicBlock.h"

using namespace llvm;

struct AFLVInstruction {
  StringRef Directory;
  StringRef Filename;
  uint32_t  Line;

  AFLVInstruction(Instruction &Inst, DebugLoc &Loc);
};

struct AFLVBasicBlock {
  uint32_t                     ID;
  std::vector<AFLVInstruction> Instructions;

  AFLVBasicBlock(BasicBlock &BB, uint32_t id);
};

class AFLVBuilder {
 public:
  void print(raw_ostream &OS);
  void dump();
  void addBasicBlock(BasicBlock &BB, uint32_t id);

 private:
  std::vector<AFLVBasicBlock> BasicBlocks;
};

#endif
